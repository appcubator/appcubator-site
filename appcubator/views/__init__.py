from django.http import HttpResponse, Http404
import simplejson

def JsonResponse(serializable_obj, **kwargs):
    """
    >>> JsonResponse({"message": "OK"})
    >>> JsonResponse({"email": ["Invalid"]}, status=400)
    """
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)
