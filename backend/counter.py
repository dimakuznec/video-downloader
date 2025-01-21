import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict

counter_app = FastAPI()

counter_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

online_users = 0
total_visits = 0
users: Dict[str, bool] = {}

@counter_app.on_event("startup")
async def startup_event():
    global total_visits
    if os.path.exists("visits.txt"):
        with open("visits.txt", "r") as f:
            total_visits = int(f.read())

@counter_app.on_event("shutdown")
async def shutdown_event():
    global total_visits
    with open("visits.txt", "w") as f:
        f.write(str(total_visits))

@counter_app.get("/visits")
async def get_visits():
    return {"totalVisits": total_visits}

@counter_app.post("/user_join/{user_id}")
async def user_join(user_id: str):
    global online_users, total_visits
    if user_id not in users:
        users[user_id] = True
        online_users += 1
        total_visits += 1
    else:
        if not users[user_id]: # Убедимся, что пользователь не является повторным
            users[user_id] = True
            online_users += 1
    return {"onlineUsers": online_users, "totalVisits": total_visits}

@counter_app.post("/user_leave/{user_id}")
async def user_leave(user_id: str):
    global online_users
    if user_id in users:
        users[user_id] = False
        online_users -= 1
    return {"onlineUsers": online_users}
