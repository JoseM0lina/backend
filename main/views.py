from django.shortcuts import render
# Importe requests y json
import requests
import json

# Create your views here.
from django.http import HttpResponse

def index(request):
    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + '/api/v1/landing'

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    print("Endpoint ", url)
    print("Response ", response_dict)

    # Respuestas totales
    total_responses = len(response_dict.keys())

    # Valores de la respuesta
    responses = response_dict.values()

    # Objeto con los datos a renderizar
    data = {
         'title': 'Landing - Dashboard',
         'total_responses': total_responses,
         'responses': responses
    }

    # Renderización en la plantilla
    return render(request, 'main/index.html', data)