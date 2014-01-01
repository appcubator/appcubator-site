{% set patterns = imports['django.patterns'] %}
{% set url = imports['django.url'] %}
{% set urlpatterns = locals['urlpatterns'] %}

{% if urls.has_admin %}
admin.autodiscover()
{% endif %}

{{urlpatterns}} {% if not urls.first_time %}{{ '+' }}{% endif %}= {{patterns}}('{{ urls.module }}',
    {% for tup in urls.routes %}
    {% set url_string = tup[0] %}
    {% set view_identifier = tup[1] %}
    {% set has_kwargs = len(tup) > 2 %}
    {% if has_kwargs %}
    {% set kwargs = tup[2] %}
    {% endif %}
    {{url}}({{ url_string }}, {{ view_identifier }}{% if has_kwargs %}, kwargs={{ kwargs_repr(kwargs) }} {% endif %}),
    {% endfor %}
)

