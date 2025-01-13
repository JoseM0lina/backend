from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from datetime import datetime
	
from firebase_admin import db

class LandingAPI(APIView):
	    
    name = 'Landing API'

    # Coloque el nombre de su colección en el Realtime Database
    collection_name = 'data'

    def get(self, request):

        # Referencia a la colección
        ref = db.reference(f'{self.collection_name}')
		    
        # get: Obtiene todos los elementos de la colección
        data = ref.get()

        # Devuelve un arreglo JSON
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
	        
        # Referencia a la colección
        ref = db.reference(f'{self.collection_name}')

        current_time  = datetime.now()
        custom_format = current_time.strftime("%d/%m/%Y, %I:%M:%S %p").lower().replace('am', 'a. m.').replace('pm', 'p. m.')
        request.data.update({"saved": custom_format })
	        
        # push: Guarda el objeto en la colección
        new_resource = ref.push(request.data)
	        
        # Devuelve el id del objeto guardado
        return Response({"id": new_resource.key}, status=status.HTTP_201_CREATED)
    
class LandingAPIDetail(APIView):

    name = 'Landing Detail API'

    collection_name = 'data'

    def get(self, request, pk):

        # Referencia al documento específico en la colección
        ref = db.reference(f'{self.collection_name}/{pk}')
        
        # Obtener el documento
        document = ref.get()
        
        if document is None:
            # Si no se encuentra el documento, devolver 404 Not Found
            return Response({"error": "Documento no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Devolver el documento con 200 OK
        return Response(document, status=status.HTTP_200_OK)

    def put(self, request, pk):
        
        # Referencia al documento específico
        ref = db.reference(f'{self.collection_name}/{pk}')
        
        # Comprobar si el documento existe
        document = ref.get()
        if document is None:
            return Response({"error": "Documento no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Validar que el cuerpo de la solicitud no esté vacío
        if not request.data:
            return Response({"error": "Datos de actualización no proporcionados"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar campos requeridos para la actualización (ejemplo)
        required_fields = ["email", "nombre"]  # Reemplaza con los campos necesarios
        missing_fields = [field for field in required_fields if field not in request.data]
        
        if missing_fields:
            return Response({"error": f"Campos faltantes: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar los datos del documento
        ref.update(request.data)
        
        return Response({"message": "Documento actualizado con éxito"}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        
        # Referencia al documento específico
        ref = db.reference(f'{self.collection_name}/{pk}')
        
        # Comprobar si el documento existe
        document = ref.get()
        if document is None:
            return Response({"error": "Documento no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        # Eliminar el documento
        ref.delete()
        
        # Responder con un código 204 No Content
        return Response({"message": "Documento eliminado con éxito"}, status=status.HTTP_204_NO_CONTENT)