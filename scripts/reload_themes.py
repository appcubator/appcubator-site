from appcubator.models import UITheme, load_initial_themes

UITheme.objects.all().delete()
load_initial_themes()
