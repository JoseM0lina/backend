from django.shortcuts import render
# Importe requests y json
import requests
import json
from datetime import datetime
from collections import Counter

# Create your views here.
from django.http import HttpResponse

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required

# Restricción de acceso con @login_required y permisos con @permission_required
@login_required
@permission_required('main.index_viewer', raise_exception=True)
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

    # Lista para almacenar las fechas en formato datetime
    fechas = {}
    conteo_dias = Counter()  # Contador para registrar cuántas respuestas hubo por día

    for response in responses:
        
        saved = response.get("saved").split(", ")
        fecha_str = saved[0]
        hora_str = saved[1].replace("\xa0", " ").replace(" a. m.", " AM").replace(" p. m.", " PM")
        fecha_date = datetime.strptime(fecha_str,"%d/%m/%Y").date()
        hora_date = datetime.strptime(hora_str, "%I:%M:%S %p").time()

        conteo_dias[fecha_date] += 1

        if fecha_date not in fechas:
            fechas[fecha_date] = [hora_date]
        else:
            fechas[fecha_date].append(hora_date)

    first_response = f'{min(fechas).strftime("%d/%m/%Y")}, {min(fechas[min(fechas)]).strftime("%I:%M:%S %p").lstrip("0").replace("PM","p. m.").replace("AM","a. m.")}'
    last_response = f'{max(fechas).strftime("%d/%m/%Y")}, {max(fechas[max(fechas)]).strftime("%I:%M:%S %p").lstrip("0").replace("PM","p. m.").replace("AM","a. m.")}'
    dia_mas_respuestas = f'{max(conteo_dias, key=conteo_dias.get, default=None).strftime("%d/%m/%Y")}'

    # Objeto con los datos a renderizar
    data = {
         'title': 'Landing - Dashboard',
         'total_responses': total_responses,
         'first_response': first_response,
         'last_response': last_response,
         'dia_mas_respuestas': dia_mas_respuestas,
         'responses': responses
    }

    # Renderización en la plantilla
    return render(request, 'main/index.html', data)