from django.http import HttpResponse, Http404
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from appcubator.models import App
from models import Provider, ProviderKey, ProviderData

from django.core.exceptions import ValidationError

def plugin_data(request, app_id, provider_id, key_name):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    provider = get_object_or_404(Provider, id=provider_id)
    provider_key = get_object_or_404(ProviderKey,
                                        provider=provider,
                                        name=key_name)

    provider_data = ProviderData.objects.filter(provider_key=provider_key, app=app)

    if request.method == "GET":
        return HttpResponse("I'm confused rn bro...")

    elif request.method == "POST":
        try:
            value = request.POST.get('value', '')
            if provider_data.exists():
                assert provider_data.count() == 1
                pdata = provider_data[0]
                pdata.value = value
                pdata.full_clean()
                pdata.save()
            else:
                pdata = ProviderData(app=app,
                                    provider_key=provider_key,
                                    value=value)
                pdata.full_clean()
                pdata.save()

            return HttpResponse("ok")
        except ValidationError, e:
            return JsonResponse(e.message_dict, status=400)
