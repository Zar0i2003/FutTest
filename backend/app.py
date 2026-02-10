from __future__ import annotations

import os
from datetime import datetime

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint


db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    photo_url = db.Column(db.String(500), nullable=False)
    gender = db.Column(db.String(40), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidate.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", name="uq_vote_user"),)


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///futtest.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["ADMIN_PASSWORD"] = os.getenv("ADMIN_PASSWORD", "admin123")

    db.init_app(app)
    CORS(app, supports_credentials=True, origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")])

    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/api/register")
    def register():
        data = request.get_json(force=True)
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""
        confirm_password = data.get("confirmPassword") or ""

        if len(username) < 3:
            return jsonify({"error": "Username must have at least 3 characters."}), 400
        if len(password) < 6:
            return jsonify({"error": "Password must have at least 6 characters."}), 400
        if password != confirm_password:
            return jsonify({"error": "Passwords do not match."}), 400
        if User.query.filter_by(username=username).first() is not None:
            return jsonify({"error": "Username is already taken."}), 409

        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully."}), 201

    @app.post("/api/login")
    def login():
        data = request.get_json(force=True)
        username = (data.get("username") or "").strip()
        password = data.get("password") or ""

        user = User.query.filter_by(username=username, password=password).first()
        if user is None:
            return jsonify({"error": "Invalid username or password."}), 401

        session["user_id"] = user.id
        session["username"] = user.username
        return jsonify({"message": "Logged in successfully.", "username": user.username})

    @app.post("/api/logout")
    def logout():
        session.clear()
        return jsonify({"message": "Logged out."})

    @app.get("/api/me")
    def me():
        if "user_id" not in session:
            return jsonify({"authenticated": False})
        return jsonify({"authenticated": True, "username": session.get("username")})

    @app.get("/api/candidates")
    def list_candidates():
        candidates = Candidate.query.order_by(Candidate.created_at.desc()).all()
        return jsonify(
            [
                {
                    "id": candidate.id,
                    "name": candidate.name,
                    "photoUrl": candidate.photo_url,
                    "gender": candidate.gender,
                    "age": candidate.age,
                    "description": candidate.description,
                }
                for candidate in candidates
            ]
        )

    @app.post("/api/vote")
    def submit_vote():
        if "user_id" not in session:
            return jsonify({"error": "Please log in before voting."}), 401

        data = request.get_json(force=True)
        candidate_id = data.get("candidateId")
        candidate = Candidate.query.get(candidate_id)
        if candidate is None:
            return jsonify({"error": "Candidate not found."}), 404

        vote = Vote.query.filter_by(user_id=session["user_id"]).first()
        if vote is None:
            vote = Vote(user_id=session["user_id"], candidate_id=candidate.id)
            db.session.add(vote)
        else:
            vote.candidate_id = candidate.id

        db.session.commit()
        return jsonify({"message": "Vote saved successfully.", "candidate": candidate.name})

    @app.post("/api/admin/login")
    def admin_login():
        data = request.get_json(force=True)
        password = data.get("password") or ""
        if password != app.config["ADMIN_PASSWORD"]:
            return jsonify({"error": "Invalid admin password."}), 401
        session["is_admin"] = True
        return jsonify({"message": "Admin authenticated."})

    def require_admin():
        if not session.get("is_admin"):
            return jsonify({"error": "Admin authentication required."}), 403
        return None

    @app.post("/api/admin/candidates")
    def create_candidate():
        auth_error = require_admin()
        if auth_error:
            return auth_error

        data = request.get_json(force=True)
        required_fields = ["name", "photoUrl", "gender", "age", "description"]
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        candidate = Candidate(
            name=data["name"].strip(),
            photo_url=data["photoUrl"].strip(),
            gender=data["gender"].strip(),
            age=int(data["age"]),
            description=data["description"].strip(),
        )
        db.session.add(candidate)
        db.session.commit()
        return jsonify({"message": "Candidate created.", "id": candidate.id}), 201

    @app.get("/api/admin/votes")
    def get_votes():
        auth_error = require_admin()
        if auth_error:
            return auth_error

        rows = (
            db.session.query(Vote, User, Candidate)
            .join(User, Vote.user_id == User.id)
            .join(Candidate, Vote.candidate_id == Candidate.id)
            .order_by(Vote.created_at.desc())
            .all()
        )

        return jsonify(
            [
                {
                    "username": user.username,
                    "candidate": candidate.name,
                    "votedAt": vote.created_at.isoformat(),
                }
                for vote, user, candidate in rows
            ]
        )

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000, debug=True)
