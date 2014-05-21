define(function(require, exports, module) {

    'use strict';

    require("backbone");

    var AutoFiller = {

        fillUIElement: function (model) {
            
            var extraData = {};

            var type = model.get('className');

            if(v1UIEState.getBaseClass(type)) {
                extraData.className = v1UIEState.getBaseClass(type);
            }

            if (type == "image") {
                extraData.src = this.stockPhotos[Math.floor(Math.random() * this.stockPhotos.length)];
            }

            if (type == "text") {
                extraData.content = this.loremIpsum();
            }

            return extraData;
        },

        stockPhotos: [
            "https://i.istockimg.com/file_thumbview_approve/19012355/2/stock-photo-19012355-world-globe-on-a-school-desk.jpg",
            "https://i.istockimg.com/file_thumbview_approve/21149086/2/stock-photo-21149086-futuristic-digital-tablet-in-the-hands.jpg",
            "https://i.istockimg.com/file_thumbview_approve/20571269/2/stock-illustration-20571269-school-grunge-pattern.jpg",
            "https://i.istockimg.com/file_thumbview_approve/18120560/2/stock-photo-18120560-students-at-computer-class.jpg",
            "https://i.istockimg.com/file_thumbview_approve/17096161/2/stock-photo-17096161-chalkboard-with-book.jpg",
            "https://i.istockimg.com/file_thumbview_approve/3516561/2/stock-photo-3516561-back-to-school-with-copyspace.jpg"
        ],

        loremIpsum: function() {
            var loremIpsumWordBank = new Array("lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipisicing", "elit,", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua.", "enim", "ad", "minim", "veniam,", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat.", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur.", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident,", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum.", "sed", "ut", "perspiciatis,", "unde", "omnis", "iste", "natus", "error", "sit", "voluptatem", "accusantium", "doloremque", "laudantium,", "totam", "rem", "aperiam", "eaque", "ipsa,", "quae", "ab", "illo", "inventore", "veritatis", "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt,", "explicabo.", "nemo", "enim", "ipsam", "voluptatem,", "quia", "voluptas", "sit,", "aspernatur", "aut", "odit", "aut", "fugit,", "sed", "quia", "consequuntur", "magni", "dolores", "eos,", "qui", "ratione", "voluptatem", "sequi", "nesciunt,", "neque", "porro", "quisquam", "est,", "qui", "dolorem", "ipsum,", "quia", "dolor", "sit,", "amet,", "consectetur,", "adipisci", "velit,", "sed", "quia", "non", "numquam", "eius", "modi", "tempora", "incidunt,", "ut", "labore", "et", "dolore", "magnam", "aliquam", "quaerat", "voluptatem.", "ut", "enim", "ad", "minima", "veniam,", "quis", "nostrum", "exercitationem", "ullam", "corporis", "suscipit", "laboriosam,", "nisi", "ut", "aliquid", "ex", "ea", "commodi", "consequatur?", "quis", "autem", "vel", "eum", "iure", "reprehenderit,", "qui", "in", "ea", "voluptate", "velit", "esse,", "quam", "nihil", "molestiae", "consequatur,", "vel", "illum,", "qui", "dolorem", "eum", "fugiat,", "quo", "voluptas", "nulla", "pariatur?", "at", "vero", "eos", "et", "accusamus", "et", "iusto", "odio", "dignissimos", "ducimus,", "qui", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti,", "quos", "dolores", "et", "quas", "molestias", "excepturi", "sint,", "obcaecati", "cupiditate", "non", "provident,", "similique", "sunt", "in", "culpa,", "qui", "officia", "deserunt", "mollitia", "animi,", "id", "est", "laborum", "et", "dolorum", "fuga.", "harum", "quidem", "rerum", "facilis", "est", "et", "expedita", "distinctio.", "Nam", "libero", "tempore,", "cum", "soluta", "nobis", "est", "eligendi", "optio,", "cumque", "nihil", "impedit,", "quo", "minus", "id,", "quod", "maxime", "placeat,", "facere", "possimus,", "omnis", "voluptas", "assumenda", "est,", "omnis", "dolor", "repellendus.", "temporibus", "autem", "quibusdam", "aut", "officiis", "debitis", "aut", "rerum", "necessitatibus", "saepe", "eveniet,", "ut", "et", "voluptates", "repudiandae", "sint", "molestiae", "non", "recusandae.", "itaque", "earum", "rerum", "hic", "tenetur", "a", "sapiente", "delectus,", "aut", "reiciendis", "voluptatibus", "maiores", "alias", "consequatur", "aut", "perferendis", "doloribus", "asperiores", "repellat");
            var minWordCount = 15;
            var maxWordCount = 100;

            var randy = Math.floor(Math.random() * (maxWordCount - minWordCount)) + minWordCount;
            var ret = "";
            for (var i = 0; i < randy; i++) {
                var newTxt = loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];
                if (ret.substring(ret.length - 1, ret.length) == "." || ret.substring(ret.length - 1, ret.length) == "?") {
                    newTxt = newTxt.substring(0, 1).toUpperCase() + newTxt.substring(1, newTxt.length);
                }
                ret += " " + newTxt;
            }
            return ret;
        },

        fillCreateForm: function (argument) {
            // body...
        }
    }

    return AutoFiller;

});