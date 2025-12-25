import os
import json
import time
from datetime import datetime, timedelta


DATA_DIR = os.getenv("DATA_DIR", "data") # Trigger Reload
ECONOMY_DB_PATH = os.path.join(DATA_DIR, "economy_db.json")
GCP_PROJECT = os.getenv("GCP_PROJECT")

# Pricing Constants (Derived from $0.50 daily cap = 100 Obols)
# 1 Obol = $0.005
# Gemini 1.5 Flash Input: $0.075 / 1M tokens ($0.000000075 / token)
# Gemini 1.5 Flash Output: $0.30 / 1M tokens ($0.0000003 / token)
# Tokens per Obol (Input) = 0.005 / 0.000000075 = 66,666
# Tokens per Obol (Output) = 0.005 / 0.0000003 = 16,666

TOKENS_PER_OBOL_INPUT = 60000 # Conservative 
TOKENS_PER_OBOL_OUTPUT = 15000 # Conservative
DAILY_CAP = 100

class EconomySystem:
    def __init__(self):
        self.use_firestore = bool(GCP_PROJECT)
        self.firestore_client = None
        self.collection = None
        self.db = {} # In-memory cache

        if self.use_firestore:
            try:
                from google.cloud import firestore
                self.firestore_client = firestore.Client(project=GCP_PROJECT)
                self.collection = self.firestore_client.collection("users")
                print(f"EconomySystem: Using Firestore (Project: {GCP_PROJECT})")
            except Exception as e:
                 print(f"EconomySystem Error: {e}. Fallback to local.")
                 self.use_firestore = False

        if not self.use_firestore:
            os.makedirs(DATA_DIR, exist_ok=True)
            self.db = self._load_db_local()
        else:
            # Firestore: We don't load EVERYTHING into memory on init.
            # We fetch on demand per user.
            pass

    def _load_db_local(self):
        if os.path.exists(ECONOMY_DB_PATH):
            try:
                with open(ECONOMY_DB_PATH, "r") as f:
                    return json.load(f)
            except:
                return {}
        return {}

    def _save_db_local(self):
        try:
            with open(ECONOMY_DB_PATH, "w") as f:
                json.dump(self.db, f, indent=2)
        except Exception as e:
            print(f"Failed to save economy DB: {e}")

    def _get_user_data(self, user_id: str) -> dict:
        if self.use_firestore:
            doc = self.collection.document(user_id).get()
            if doc.exists:
                return doc.to_dict()
            return {}
        else:
            return self.db.get(user_id, {})

    def _save_user_data(self, user_id: str, data: dict):
        if self.use_firestore:
            self.collection.document(user_id).set(data, merge=True)
        else:
            self.db[user_id] = data
            self._save_db_local()

    def get_user_state(self, user_id: str):
        now = time.time()
        user_data = self._get_user_data(user_id)
        
        if not user_data:
            user_data = {
                "balance": DAILY_CAP,
                "last_refill": now
            }
            self._save_user_data(user_id, user_data)
        
        # Check for Daily Refill
        last_refill = user_data.get("last_refill", 0)
        # If > 24 hours (86400 seconds) have passed
        if now - last_refill > 86400:
            user_data["balance"] = DAILY_CAP
            user_data["last_refill"] = now
            self._save_user_data(user_id, user_data)
            print(f"💰 Daily Refilled for {user_id}")
            
        return user_data
    
    # Adapt check_balance and spend to use get_user_state which is now abstract
    # (Existing methods use get_user_state, so logic holds, provided we update SAVE logic inside them)


    def check_balance(self, user_id: str) -> float:
        return self.get_user_state(user_id)["balance"]

    def spend(self, user_id: str, amount: float, reason: str) -> bool:
        user_data = self.get_user_state(user_id)
        if user_data["balance"] >= amount:
            user_data["balance"] -= amount
            # Track transaction log if needed, simple print for now
            print(f"💸 {user_id} spent {amount:.2f} Obols on {reason}. Remaining: {user_data['balance']:.2f}")
            self._save_user_data(user_id, user_data)
            return True
        else:
            print(f"🚫 {user_id} insufficient funds for {reason}. Cost: {amount}, Has: {user_data['balance']}")
            return False

    def award_reward(self, user_id: str, amount: float, event_id: str = None) -> bool:
        """
        Awards funds to the user.
        If event_id is provided, ensures this reward is only given once per event_id.
        Returns True if awarded, False if already claimed.
        """
        user_data = self.get_user_state(user_id)
        
        if event_id:
            completed_events = user_data.get("completed_events", [])
            if event_id in completed_events:
                return False
            
            completed_events.append(event_id)
            user_data["completed_events"] = completed_events
            
        user_data["balance"] += amount
        print(f"💰 {user_id} rewarded {amount:.2f} Lepta. New Balance: {user_data['balance']:.2f}")
        self._save_user_data(user_id, user_data)
        return True

    def estimate_cost(self, input_chars: int, output_chars: int) -> float:
        # Crude token estimation: 1 token ~= 4 chars
        input_tokens = input_chars / 4
        output_tokens = output_chars / 4
        
        cost = (input_tokens / TOKENS_PER_OBOL_INPUT) + (output_tokens / TOKENS_PER_OBOL_OUTPUT)
        # Minimum cost 0.1 Obols to avoid tiny fractions being ignored? 
        # Or just let them accumulate. Let's round to 2 decimals, min 0.01.
        return max(0.01, round(cost, 2))

economy = EconomySystem()
