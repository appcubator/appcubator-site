define(['util'], function() {


        util.path = function(path) {

            return {
                packageModuleName: function() {
                    var tokens = path.split('.');
                    var module, package, name, version;
                    // TODO care about version nums. for now everything is 0.1.

                    version = "0.1";

                    if (tokens.length == 2) {
                        package = 'root';
                        module = tokens[0];
                        name = tokens[1];
                    } else if (tokens.length == 3) {
                        package = tokens[0];
                        module = tokens[1];
                        name = tokens[2];
                    } else {
                        throw { name: 'GenPathSyntax', message: "Invalid generator reference syntax. Must provide '[package.]module.name' .  Original: " + generatorName };
                    }


                    return { package: package, module: module, name: name, version: version };
                },

                tokensToPath: function(tokens) {
                    return tokens.package + '.' + tokens.module + '.' + tokens.name;
                },

                changeName: function(newName) {
                    var tokens = this.packageModuleName(path);
                    tokens.name = newName;

                    return this.tokensToPath(tokens);
                },

                changeModule: function(newModule) {
                    var tokens = this.packageModuleName(path);
                    tokens.module = newModule;

                    return this.tokensToPath(tokens);
                },

                changePackage: function(newPackage) {
                    var tokens = this.packageModuleName(path);
                    tokens.package = newPackage;

                    return this.tokensToPath(tokens);
                }

            };

        };

    });
