from django import template

register = template.Library()

@register.filter
def fix_solidus(value):
    return value.replace(r"</", r"<\/")
