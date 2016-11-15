// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

'use strict'
var fs = require('fs')
var readline = require('readline')


class JDatabase {
    constructor(dirpath, path) {

        this.dir = {
            path: dirpath
        }

        this.file = {
            path: path
        }

        this.db = {
            isCompressed: false,
            isCompacted: false
        }

        this.core = {
            handleEx: false,
            log: {
                active: true,
                dir: (this.dir.path + this.file.path + '/log').toString()
            },
            njdbfy: (data) => {
                if ( this.db.isCompacted ) { return JSON.stringify(data) }
                else { return JSON.stringify(data, null, 4) }
            },
            compress: () => {
                let dbData = fs.readFileSync(this.dir.path + '/' + this.file.path + '.json')
                dbData = JSON.parse(dbData)
                dbData = JSON.stringify(dbData)
                fs.writeFileSync(this.dir.path + '/' + this.file.path + '.json', dbData)
            },
            fancify: () => {
                let dbData = fs.readFileSync(this.dir.path + '/' + this.file.path + '.json')
                dbData = JSON.parse(dbData)
                dbData = JSON.stringify(dbData, null, 4)
                fs.writeFileSync(this.dir.path + '/' + this.file.path + '.json', dbData)
            }
            // Autosaves
        }
            // Avoid crashes
            if ( this.core.handleEx == true ) {
                process.on(`uncaughtException`, (err) => { this.log.write( `An exeption occured, NJDB handle every exeptions for data security, if you want that NJDB stop handling exeptions, set 'db.core.handleEx = false', error: \n${err}`, 'danger') })
            }

        this.tables = { }

        this.create = (force) => {
            let dbPath = this.dir.path + '/' + this.file.name
            let dirExists = true
            let fileExists = true
            let toWrite

            // I don't know why i got a bug when dir root and file path are the same :|
            if ( this.dir.path.substring(2, this.length) == this.file.path ) { this.file.path += (Math.random().toString()).substring(2, 3) }

            // If true, disable any protections.
            if ( force != true ) {

                // Check for dir
                try {
                    fs.accessSync(this.dir.path)
                } catch (e) {
                    dirExists = false
                    fs.mkdirSync(this.dir.path)
                    this.log.log('Creating directory..', 'info')
                }

                // Check for file
                try {
                    fs.accessSync(this.file.path)
                } catch (e) {
                    fileExists = false
                }

                if ( dirExists ) { this.log.log(this.dir.path + ' directory already exists! For security reasons, to overwrite your databases, please delete them manualy (/!\\ or give true as argument /!\\).', 'danger'); return }
                if ( fileExists ) { this.log.log(this.file.path + ' database already exists! For security reasons, to overwrite your database, please delete it manualy (/!\\or give true as argument /!\\).', 'danger'); return }

                fs.writeFileSync( this.dir.path + '/' + this.file.path + '.json', this.core.njdbfy( {} ))
                fs.writeFileSync( this.dir.path + '/' + 'log.log', '')
                fs.writeFileSync( this.dir.path + '/' + 'log.html', '')
            }
            else {
                fs.writeFileSync( this.dir.path + '/' + this.file.path + '.json', this.core.njdbfy( {} ))
                fs.writeFileSync( this.dir.path + '/' + 'log.log', '')
                fs.writeFileSync( this.dir.path + '/' + 'log.html', '')
            }

        }

        this.table = (tableName) => {
            let dbPath = this.dir.path + '/' + this.file.path + '.json'

            this.tables[tableName] = {
                name: tableName,
                create: (template) => {
                    if ( template == undefined ) template = {}
                    let data = fs.readFileSync(dbPath, 'utf8')
                    let content = JSON.parse(data)
                    if ( content[tableName] ) { this.log.write('table "' + tableName + '" already exists! For security reasons, to overwrite it, please delete this table manualy.', 'danger' ); return }
                    content[tableName] = template
                    fs.writeFileSync(dbPath, this.core.njdbfy(content))

                },

                put: (key, value) => {
                    let data = fs.readFileSync(dbPath, 'utf8')
                    let content = JSON.parse(data)

                    if ( content[tableName][key] ) { this.log.log('key "' + key + '" already exists! For security reasons, to overwrite it, please delete this key manualy.', 'danger' ); return }
                    content[tableName][key] = value
                    fs.writeFileSync(dbPath, this.core.njdbfy(content))
                    this.log.log(`Put ${value} as ${key} in ${dbPath}`)
                },

                get: (key, fancy) => {
                    let data = fs.readFileSync(dbPath, 'utf8')
                    let content = JSON.parse(data)

                    if ( !key ) { return content[tableName] }
                    if ( !content[tableName][key] ) { this.log.log('key "' + key + '" doesn\' exists!', 'danger' ); return }
                    if ( !fancy ){ return (content[tableName][key]) }
                    else { return this.core.njdbfy( content[tableName][key] ) }
                },

                update: (key, value) => {
                    let data = fs.readFileSync(dbPath, 'utf8')
                    let content = JSON.parse(data)

                    if ( !content[tableName][key] ) { this.log.log('key "' + key + '" doesn\' exists!', 'danger' ); return }
                    if ( key == undefined ) { content[tableName] = value }
                    else { content[tableName][key] = value }
                    fs.writeFileSync(dbPath, this.core.njdbfy(content))
                },

                delete: (key) => {
                    let data = fs.readFileSync(dbPath, 'utf8')
                    let content = JSON.parse(data)

                    if (!key) {
                        if (!content[tableName]) { this.log.log('table ' + tableName + ' doesn\'t exists!', 'danger'); return }
                        else {
                            delete content[tableName]
                            fs.writeFileSync(dbPath, this.core.njdbfy(content))
                            this.log.log(`Table ${tableName} deleted!`)
                        }
                    } else {
                        if ( !content[tableName][key] ) { this.log.log('key "' + key + '" doesn\' exists!', 'danger' ); return }
                        delete content[tableName][key]
                        fs.writeFileSync(dbPath, this.core.njdbfy(content))
                        this.log.log(`Key ${key} of table ${tableName} was deleted!`)
                    }
                }

            }

            return this.tables[tableName]
        }

        this.log = {
            log: (data, type) => {
                    if ( type == 'danger' ) { console.error(data) }
                    else { console.log(data) }
            },
            write: (data, type) => {
                    if ( !this.core.log.active ) { return }
                    if (type == undefined) { type = 'log' }
                    let d = new Date();

                    let time = ( d.toLocaleDateString() + '|' + d.toLocaleTimeString() ).toString()
                    let typeStyle
                    let msgStyle
                    if (type == 'info') { typeStyle = 'color: blue;'; msgStyle = 'color: white' }
                    if (type == 'log') { typeStyle = 'color: #888888;'; msgStyle = 'color: white;' }
                    if (type == 'danger') { typeStyle = 'color: red;'; msgStyle='font-weight: 600; color: red;'}
                    if (type == 'success') { typeStyle = 'color: green;'; msgStyle='font-weight: 100; color: #2ecc71;'}
                    fs.appendFile(this.dir.path + this.file.path + '/log' + '.log', time + ' [' + type + ']' + ' >> ' + data + '\n')
                    fs.appendFile(this.dir.path + this.file.path + '/log' + '.html', '<span style="color:grey;">' + time + '</span>' + '<span style="' + typeStyle + '">' + ' [' + type + ']' + '</span>' +  ' >> ' + '<span style="' + msgStyle + '">' + data + '</span>' + '<br/>')

                    if (type == 'danger') { console.log(data) }
                    else { console.log(data) }

            },
            open: () => {
                var exec = require('child_process').exec;
                let os = process.platform
                if (os == 'win32' || os == 'win64') {
                    var cmd = 'cd database & log.html';

                    exec(cmd, function(error, stdout, stderr) {
                        if (error) console.log(error)
                    });
                } else if( os == 'linux') {
                    var cmd = 'cd database & xdg-open log.html';

                    exec(cmd, function(error, stdout, stderr) {
                      this.log.write(stdout)
                    });
                }
            },
            clear: () => {
                fs.writeFileSync(this.dir.path + this.file.path + '/log' + '.log', '')
                fs.writeFileSync(this.dir.path + this.file.path + '/log' + '.html', '<link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet"> <style>html {font-family: "Inconsolata", monospace; background: black; color: white;}</style>')
            }
        }

        this.QueryCLI = (indentifier) => {
            if (indentifier == undefined) indentifier = '-/'
            const querystring = require('querystring');
            console.log('< NJDB Query CLI started >')

            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });

            rl.on('line', (input) => {
              if ( input.substring(0, indentifier.length).toString() == indentifier) {
                  let querystr = input.substring(indentifier.length, input.length)
                  let parsed = querystring.parse(querystr, '.')
                  let queryArr = []
                  for ( var query in parsed ) {
                     queryArr.push(query)
                  }

                  // Decision three
                 if ( queryArr[0] == 'db' ) {
                     if ( queryArr[1] == 'create()' ) {
                         this.create()
                     } else if ( queryArr[1].substring(0, 5) == 'table' ) {
                         var table = ''
                         var targetQuery = queryArr[1].substring(6, queryArr[1].lenght)
                         // Get table name inside func
                         for ( var char in targetQuery  ) {
                             if ( targetQuery[char] != "'" && targetQuery[char] != ')' && targetQuery[char] != ' ' ) table +=  targetQuery[char]
                         }

                        if ( queryArr[2].substring(0, 3) == 'get' ) {
                            targetQuery = queryArr[2].substring(4, queryArr[2].lenght )
                            var toGet =  ''
                            for ( var char in targetQuery ) {
                                if ( targetQuery[char] != "'" && targetQuery[char] != ")" ) {
                                    toGet += targetQuery[char]
                                }
                            }
                            this.log.write(this.table(`${table}`).get(`${toGet}`), 'info')
                        } else if ( queryArr[2].substring(0, 3) == 'put' ) {
                            targetQuery = queryArr[2].substring(4, queryArr[2].lenght )
                            var toPut =  {}
                            parsed = querystring.parse(targetQuery, ',')
                            let i = 0
                            for ( var val in parsed ) { toPut[i] = val; i++ }

                            toPut[1] = toPut[1].toString().slice(1, -1)
                            toPut[0] = toPut[0].replace(/[\"\']+/g, '')
                            toPut[1] = toPut[1].replace(/[\"\']+/g, '')

                            this.table(table).put(toPut[0], toPut[1] )
                        } else if ( queryArr[2].substring(0, 6) == 'update' ) {
                            targetQuery = queryArr[2].substring(7, queryArr[2].lenght )
                            var toUpd =  {}
                            parsed = querystring.parse(targetQuery, ',')
                            let i = 0
                            for ( var val in parsed ) { toUpd[i] = val; i++ }
                            toUpd[1] = toUpd[1].toString().slice(1, -1)
                            this.table(table).update(toUpd[0], toUpd[1])
                        } else if ( queryArr[2].substring(0, 8) == 'create()' ) {
                            this.table(`${table}`).create()
                        } else if ( queryArr[2].substring(0, 6) == 'delete' ) {
                            if ( queryArr[2] == 'delete()' ) {
                                this.table(table).delete()
                            } else {
                                let keyDel = queryArr[2].substring(8, queryArr[2].lenght).toString()
                                keyDel = keyDel.slice(0, -2)
                                this.table(table).delete(keyDel)
                            }
                        } else { this.log.write( 'Invalid NJDB CLI command!', 'danger' ) }

                    } else if ( queryArr[1] == 'log' ) {
                        if ( queryArr[2] == 'open()' ) {
                            this.log.open()
                        } else if (  queryArr[2] == 'clear()' ) {
                            this.log.clear()
                        }
                    } else if (queryArr[1]  == 'core') {
                        if (queryArr[2] == 'compress()') {
                            this.core.compress()
                        } else if (queryArr[2] == 'fancify()') {
                            this.core.fancify()
                        } else { this.log.write( 'Invalid NJDB CLI command!', 'danger' )  }
                    } else { this.log.write( 'Invalid NJDB CLI command!', 'danger' ) }
                } else if ( queryArr[0] == 'help' ) {
                    console.log(`< NJDB Query CLI help >

${indentifier}db
    .create(force[true||false@default]): Create a new database. Overwrite if true gived as arg.
    .table('tableName'): Select table as target.
        .create(): Create new table as '.table()' argument.
	.put('key', 'value'): Insert string or int as key into db, don't support objects. Use real editor.
        .update('key', 'newValue'): Update key.
        .get('key', 'value'): Get value from key.
        .delete('key'): Remove key and he's value.
        .get(): Get table.
        .delete(): Delete table.
    .log
        .open(): Open logs in HTML file.
        .clear(): Clear logs.
    .core
        .compress(): Improve database's speed by compressing data, use only for production.
        .fancify(): Fancify database for humain readability, less faster, use this command only for reading.
    .makeBenchmark(ops): Run a benchmark on a new db with arg Put, Update, Delete operations.
`)
                } else if ( queryArr[0].substring(0, 13) == 'makeBenchmark' ) {
                    let ops = queryArr[0].substring(14, this.length)

                    ops = ops.substring(0, ops.length - 1)
                    makeBenchmark(ops)
                } else { this.log.write( 'Invalid NJDB CLI command!', 'danger' ) }

             }
            });
        }


    }
}


function makeBenchmark(ops) {
    if ( ops == undefined ) { console.error('Need number of operations in argument.'); return; }
    if ( process.platform != 'linux' ) { console.warn(`Starting benchmark for ${ops} ops, keep in mind that your OS can slow down nodejs process, for this reason, you should benchmark on a real server.`) }
    let benchDB = new JDatabase('./~BENCHMARK~', Math.random().toString().substring(14))
    benchDB.create()
    benchDB.table('Benchmark').create()
    console.time('Put')
    benchDB.table('Benchmark').create()
    for ( var i = 0; i < ops; i++ ) {
      benchDB.table('Benchmark').put(i, i)
    }
    var a = console.timeEnd('Put')

    // Update
    console.time('Update')
    for ( var i = 0; i < ops; i++ ) {
      benchDB.table('Benchmark').update(i, 'klj')
    }
    console.timeEnd('Update')

    // Delete
    console.time('Delete')
    for ( var i = 0; i < ops; i++ ) {
      benchDB.table('Benchmark').delete(i.toString())
    }

    if( fs.existsSync(benchDB.dir.path) ) {
        fs.readdirSync(benchDB.dir.path).forEach(function(file,index){
          var curPath = benchDB.dir.path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(benchDB.dir.path);
      }
    console.timeEnd('Delete')
    console.log('When there is more than 1 000 keys in the same file, we recommand you to split a big database into smallers databases.')
}


module.exports = {
    JDatabase: JDatabase,
    makeBenchmark: makeBenchmark
}