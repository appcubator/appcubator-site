from appcubator.models import UITheme, load_initial_themes

if __name__ == "__main__":

    for t in UITheme.objects.all():
        t.delete()
    load_initial_themes()
