// JSpec - Growl - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

;(function(){
  
  Growl = {
    
    // --- Version
    
    version: '1.0.0',
    
    /**
     * Execute the given _cmd_, returning an array of lines from stdout.
     *
     * Examples:
     *
     *   Growl.exec('growlnotify', '-m', msg)
     *
     * @param  {string ...} cmd
     * @return {array}
     * @api public
     */

    exec: function(cmd, args, message) {
      // var lines = [], line
      // with (JavaImporter(java.lang, java.io)) {
      //   var proccess = Runtime.getRuntime().exec(Array.prototype.slice.call(arguments))
      //   var stream = new DataInputStream(proccess.getInputStream())
      //   while (line = stream.readLine())
      //     lines.push(line + '')
      //   stream.close()    
      // }
      // return lines
      
      var sys = require('sys');
      var exec = require('child_process').exec;
      var command = cmd + ' ' + args + ' ' + message;
      exec(command); // This normally takes a callback, but since we don't care about the output really, we wont pass one
      return ""; // We'll just return an empty string since we can't syncronously hook into the results of the exec() call
    },
    
    /**
     * Return the extension of the given _path_ or null.
     *
     * @param  {string} path
     * @return {string}
     * @api private
     */
    
    extname: function(path) {
      return path.lastIndexOf('.') != -1 ? 
        path.slice(path.lastIndexOf('.') + 1, path.length) :
          null
    },

    /**
     * Version of the 'growlnotify' binary.
     *
     * @return {string}
     * @api private
     */

    binVersion: function() {
      /* try { return this.exec('growlnotify', '-v')[0].split(' ')[1] } catch (e) {} */
      // var version = "growlnotify 1.2 \nCopyright (c) The Growl Project, 2004-2008"
      // try { return version[0].split(' ')[1] } catch (e) {}
      return "1.2"
    },

    /**
     * Send growl notification _msg_ with _options_.
     *
     * Options:
     *
     *  - title   Notification title
     *  - sticky  Make the notification stick (defaults to false)
     *  - name    Application name (defaults to growlnotify)
     *  - image
     *    - path to an icon sets --iconpath
     *    - path to an image sets --image
     *    - capitalized word sets --appIcon
     *    - filename uses extname as --icon
     *    - otherwise treated as --icon
     *
     * Examples:
     *
     *   Growl.notify('New email')
     *   Growl.notify('5 new emails', { title: 'Thunderbird' })
     *
     * @param {string} msg
     * @param {options} hash
     * @api public
     */

    notify: function(msg, options) {
      options = options || {}
      var args = ['growlnotify', '-m', msg]
      if (!this.binVersion()) throw new Error('growlnotify executable is required')
      if (image = options.image) {
        var flag, ext = this.extname(image)
        flag = flag || ext == 'icns' && 'iconpath'
        flag = flag || /^[A-Z]/.test(image) && 'appIcon'
        flag = flag || /^png|gif|jpe?g$/.test(ext) && 'image'
        flag = flag || ext && (image = ext) && 'icon'
        flag = flag || 'icon'
        args.push('--' + flag, image)
      }
      if (options.sticky) args.push('--sticky')
      if (options.name) args.push('--name', options.name)
      if (options.title) args.push(options.title)
      /* this.exec.apply(this, args) */
      this.exec.apply(this, args)
    }
  }
  
  JSpec.include({
    name: 'Growl',
    reporting: function(options){
      var stats = JSpec.stats
      if (stats.failures) Growl.notify('failed ' + stats.failures + ' assertions', { title: 'JSpec'})
      else Growl.notify('passed ' + stats.passes + ' assertions', { title: 'JSpec' })
    }
  })
  
})()


