var appState = {
    "info": {
        "keywords": "",
        "description": ""
    },
    "users": [
        {
            "name": "Admin",
            "fields": []
        },
        {
            "name": "Editor",
            "fields": []
        },
        {
            "name": "Member",
            "fields": []
        }
    ],
    "emails": [
        {
            "content": "Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team",
            "name": "Welcome Email",
            "subject": "Thanks for Signing up!"
        }
    ],
    "tables": [
        {
            "name": "Class",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Description",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Professor",
                    "required": true,
                    "type": "fk",
                    "entity_name": "Teacher",
                    "related_name": "Classes"
                }
            ]
        },
        {
            "name": "Teacher",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Bio",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Favorite student",
                    "required": true,
                    "type": "o2o",
                    "entity_name": "Student",
                    "related_name": "teacher"
                }
            ]
        },
        {
            "name": "Student",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Bio",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Classes",
                    "required": true,
                    "entity_name": "Class",
                    "type": "m2m",
                    "related_name": "enrolled students"
                }
            ]
        }
    ],
    "pages": [
        {
            "url": {
                "urlparts": []
            },
            "navbar": {
                "isFixed": true,
                "brandName": null,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "customText": "Add custom footer text here",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "uielements": [],
            "name": "Homepage",
            "access_level": "all"
        },
        {
            "navbar": {
                "isFixed": true,
                "brandName": null,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "customText": "Add custom footer text here",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "url": {
                "urlparts": [
                    "registration"
                ]
            },
            "uielements": [],
            "name": "Registration Page",
            "access_level": "all"
        }
    ],
    "mobilePages" : [],
    "name": "thisisirrelevant"
};
