var recursiveReaddir = require('recursive-readdir'),
    fs = require('fs'),
    esprima = require('esprima'),
    estraverse = require('estraverse'),
    escodegen = require('escodegen'),
    util = require('util');


function makeGlobal(name) {
    return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "window"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": name
                    }
                },
                "right": {
                    "type": "Identifier",
                    "name": name
                }
            }
        }
}


recursiveReaddir('../src/', function (err, files) {
    // Files is an array of filename
    //console.log(files);

    for (var i = 0; i < files.length; i++) {
        var data = fs.readFileSync(files[i], 'utf8');
        var ast = esprima.parse(data);
        //console.log(ast);

        var parentBody;
        estraverse.traverse(ast, {
            enter: function (node, parent) {
                if (util.isArray(node.body)) {
                    parentBody = node.body;
                }
            },
            leave: function(node,parent) {

                if (util.isArray(node.body)) {
                    console.log('cosik2', node);
                }
                if(node.type === 'NewExpression' && node.callee.name.indexOf('ViewModel') > -1) {

                    if (parent.type === 'AssignmentExpression') {
                        parentBody.push(makeGlobal(parent.left.name));
                    }
                    
                }
            }
        });

        regenerated_code = escodegen.generate(ast);

        console.log(regenerated_code);

        fs.writeFile(files[i], regenerated_code);
    }

});