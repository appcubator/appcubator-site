


def get_default_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s


def get_default_mobile_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "mobile_uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s


class UITheme(models.Model):
    name = models.CharField(max_length=255, blank=True)
    designer = models.ForeignKey(User, blank=True, null=True)
    parent_theme = models.ForeignKey(
        'self', blank=True, null=True, default=None)
    image = models.URLField(
        blank=True, default="http://appcubator.com/static/img/theme4.png")

    web_or_mobile = models.CharField(max_length=1,
                                     choices=(('W', 'Web'), ('M', 'Mobile')),
                                     default = 'W')

    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)

    # Audit field
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def get_state(self):
        return simplejson.loads(self._uie_state_json)

    def set_state(self, val):
        self._uie_state_json = simplejson.dumps(val)

    uie_state = property(get_state, set_state)

    @classmethod
    def create_mobile_theme(cls, name, user):
        theme = cls(name=name, designer=user, web_or_mobile='M')
        theme._uie_state_json = get_default_mobile_uie_state()
        theme.save()
        return theme

    def to_dict(self):
        try:
            designer = User.objects.get(pk=self.designer_id).username,
        except User.DoesNotExist:
            designer = 'v1 Factory'

        return {'id': self.id,
                'name': self.name,
                'designer': designer,
                'image': self.image,
                'statics': simplejson.dumps(list(self.statics.values())),
                'uie_state': self.uie_state,
                'web_or_mobile': self.web_or_mobile}

    def clone(self, user=None):
        new_self = UITheme(name=self.name,
                           _uie_state_json=self._uie_state_json,
                           parent_theme=self,
                           designer=user)
        return new_self

    @classmethod
    def get_mobile_themes(cls):
        themes = cls.objects.filter(web_or_mobile='M')
        return themes

    @classmethod
    def get_web_themes(cls):
        themes = cls.objects.filter(web_or_mobile='W')
        return themes

class StaticFile(models.Model):
    name = models.CharField(max_length=255)
    url = models.TextField()
    type = models.CharField(max_length=100)
    app = models.ForeignKey(App, blank=True, null=True, related_name="statics")
    theme = models.ForeignKey(
        UITheme, blank=True, null=True, related_name="statics")


def load_initial_themes():
    theme_json_filenames = os.listdir(
        os.path.join(DEFAULT_STATE_DIR, "themes"))

    for filename in theme_json_filenames:
        if not filename.endswith('json'):
            continue
        try:
            sys.stdout.write("Loading %s" % filename)
            s = simplejson.loads(get_default_data(
                os.path.join("themes", filename)))
            sys.stdout.write(".")
            assert 'lines' in s
            t = UITheme(name=filename.replace(".json", ""))
            sys.stdout.write(".")
            t.set_state(s)
            sys.stdout.write(".")
            try:
                t.image = t.uie_state['img_url']
            except KeyError:
                sys.stdout.write("No key img_url for %r" % filename)
            sys.stdout.write(".")
            t.full_clean()
            sys.stdout.write(".")
            t.save()
            sys.stdout.write(".")
            print ""
        except Exception:
            # don't crash if one theme fails
            print "\nError with %s" % filename
            traceback.print_exc()

