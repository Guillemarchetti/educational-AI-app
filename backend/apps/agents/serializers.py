from rest_framework import serializers

class MessageSerializer(serializers.Serializer):
    """
    Serializer para mensajes del agente médico
    """
    userId = serializers.CharField(max_length=100)
    text = serializers.CharField(max_length=5000)
    
    def validate_text(self, value):
        """
        Validar que el texto no esté vacío
        """
        if not value.strip():
            raise serializers.ValidationError("El texto no puede estar vacío")
        return value
    
    def validate_userId(self, value):
        """
        Validar que el userId no esté vacío
        """
        if not value.strip():
            raise serializers.ValidationError("El userId no puede estar vacío")
        return value 