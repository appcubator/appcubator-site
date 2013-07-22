var constantContainers = {
  'facebook' : {
    provider: "facebook",
    action: "thirdpartylogin",
    content: "Login w/ Facebook",
    container_info: {},
    goto: ""
  },
  'twitter' : {
    provider: "twitter",
    action: "thirdpartylogin",
    content: "Login w/ Twitter",
    container_info: {},
    goto: ""
  },
  'linkedin' : {
    provider: "linkedin",
    action: "thirdpartylogin",
    content: "Login w/ LinkedIn",
    container_info: {},
    goto: ""
  },
  'Local Login': {
    name: "local login",
    action: "login",
    fields : [
                    {
                        "field_name": "username",
                        "placeholder": "Email or username",
                        "label": "",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": ''
                    },
                    {
                        "name": "password",
                        "placeholder": "Password",
                        "label": "",
                        "displayType": "password-text",
                        "type": "password",
                        "options": ''
                    },
                    {
                        "placeholder": "Login",
                        "label": "",
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
                        "field_name": "Email",
                        "placeholder": "Email Address",
                        "label": "Email Address",
                        "displayType": "email-text",
                        "type": "email",
                        "options": ''
                    },
                    {
                        "name": "Name",
                        "placeholder": "Name",
                        "label": "Name",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": ''
                    },
                    {
                        "name": "password",
                        "placeholder": "Password",
                        "label": "Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": ''
                    },
                    {
                        "placeholder": "Sign Up",
                        "displayType": "button",
                        "type": "button"
                    }
              ],
    "goto": "internal://Homepage",
    "name": "Sign Up"
  }
};
