import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_id = data.get('userId')
        text = data.get('text')
        # Lógica de agente dummy (por ejemplo, llamar a OpenAI aquí)
        response_text = f"Respuesta en tiempo real: «{text}»"
        await self.send(text_data=json.dumps({
            'from': 'agent',
            'text': response_text
        })) 