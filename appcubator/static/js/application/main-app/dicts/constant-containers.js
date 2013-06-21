var constantContainers = {
  'facebook' : {
    provider: "facebook",
    action: "thirdpartylogin",
    content: "Login w/ Facebook",
    goto: ""
  },
  'twitter' : {
    provider: "twitter",
    action: "thirdpartylogin",
    content: "Login w/ Twitter",
    goto: ""
  },
  'linkedin' : {
    provider: "linkedin",
    action: "thirdpartylogin",
    content: "Login w/ Twitter",
    goto: ""
  },
  'Local Login': {
    name: "local login",
    action: "login",
    entity: "User",
    fields : [
                    {
                        "field_name": "username",
                        "placeholder": "Username",
                        "label": "Username",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": []
                    },
                    {
                        "name": "password",
                        "placeholder": "Password",
                        "label": "Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "placeholder": "Login",
                        "label": "Login",
                        "displayType": "button",
                        "type": "button"
                    }
    ],
    loginRoutes: []
  },
  'Sign Up' : {
    "action": "signup",
    "entity": "User",
    "fields": [
                    {
                        "field_name": "username",
                        "placeholder": "Username",
                        "label": "Username",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": []
                    },
                    {
                        "name": "password1",
                        "placeholder": "Password",
                        "label": "Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "name": "password2",
                        "placeholder": "Confirm Password",
                        "label": "Confirm Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "field_name": "Email",
                        "placeholder": "Email Address",
                        "label": "Email Address",
                        "displayType": "email-text",
                        "type": "email",
                        "options": []
                    },
                    {
                        "field_name": "Sign Up",
                        "placeholder": "Sign Up",
                        "displayType": "button",
                        "type": "button"
                    }
              ],
    "goto": "internal://Homepage",
    "name": "Sign Up"
  }
};
