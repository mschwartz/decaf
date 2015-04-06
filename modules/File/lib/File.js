/*!
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 6/29/13
 * Time: 9:21 PM
 */

/**
 * # File module
 *
 * File system access via java.io.File API
 */
/** @private
 // inspired by helma.File
 * */


/** @private */
/*global java, module */
"use strict";

var JavaFile = java.io.File,
    BufferedReader = java.io.BufferedReader,
    Writer = java.io.Writer,
    FileReader = java.io.FileReader,
    PrintWriter = java.io.PrintWriter,
    FileOutputStream = java.io.FileOutputStream,
    OutputStreamWriter = java.io.OutputStreamWriter,
    FileInputStream = java.io.FileInputStream,
    InputStreamReader = java.io.InputStreamReader,
    ByteArrayOutputStream = java.io.ByteArrayOutputStream,
    BufferedInputStream = java.io.BufferedInputStream;

/**
 * ## Create a new File object representing a path.
 *
 * ### Example
 *
 * ```javascript
 * var File = require('file');
 * var file = new File('path/to/some/file_or_directory');
 * ```
 *
 * @class File
 * @constructor
 * @param {string} path that the File will represent, relative to where you started decaf, or absolute.
 */
function File(path) {
    /**
     * ### java.io.File instance
     *
     * @property file
     */
    if (arguments.length > 1) {
        this.file = new JavaFile(path, arguments[1]).getAbsoluteFile();
    }
    else {
        this.file = new JavaFile(path).getAbsoluteFile();
    }
    /**
     * Instance of a java reader or writer
     *
     * @private
     */
    this.readerWriter = null;
}

// Static members of File class
decaf.extend(File, {
    /**
     * ## static createTempFile(prefix, suffix, directory) : File
     *
     * Creates an empty file in the specified directory, using the given prefix and suffix strings to generate its name.
     *
     * NOTE: this is a static method.
     *
     * @method createTempFile
     * @static
     * @param {string} prefix - The prefix string to be used in generating the file's name; must be at least three characters long
     * @param {string} suffix - The suffix string to be used in generating the file's name; may be null, in which case the suffix ".tmp" will be used
     * @param {string} directory - The directory in which the file is to be created, or null if the default temporary-file directory is to be used
     * @return {File} File instance refering to the newly created temporary file
     */
    createTempFile : function (prefix, suffix, directory) {
        if (prefix === undefined) {
            prefix = 'tmp-';
        }
        if (suffix === undefined) {
            suffix = '.tmp';
        }
        if (directory) {
            if (typeof directory === 'string') {
                directory = new JavaFile(directory).getAbsolutePath();
            }
            return new File(JavaFile.createTempFile(prefix, suffix, directory).getAbsolutePath());
        }
        else {
            return new File(JavaFile.createTempFile(prefix, suffix).getAbsolutePath());
        }
    },
    /**
     * ## static File.pathSeparator : string
     *
     * The system-dependent path-separator character.
     *
     * On UNIX systems the value of this field is ':'.
     *
     * On Microsoft Windows systems it is ';'.
     *
     * @property pathSeparator
     * @type String
     */
    pathSeparator  : String(JavaFile.pathSeparator),
    /**
     * ## static File.separatorChar : string
     *
     * The system-dependent default name-separator character.
     *
     * This field is initialized to contain the first character of the value of the system property file.separator.
     *
     * On UNIX systems the value of this field is '/'; on Microsoft Windows systems it is '\'.
     *
     * @property separatorChar
     * @type String
     */
    separatorChar  : String.fromCharCode(JavaFile.separatorChar),
    /**
     * ## static File.tmpDir : string
     *
     * The system wide temporary directory path
     *
     * @property tmpDir
     * @type String
     */
    tmpDir         : String(java.lang.System.getProperties().get('java.io.tmpdir'))
});

decaf.extend(File.prototype, {
    /**
     * ## file.canExecute() : boolean
     *
     * Tests whether the application can execute the file denoted by this abstract pathname.
     *
     * ### Returns:
     * - true if file can be executed
     * @method canExecute
     * @return {boolean} true if file can be executed
     */
    canExecute       : function () {
        return !!this.file.canExecute();
    },
    /**
     * ## file.canRead() : boolean
     *
     * Tests whether the application can read the file denoted by this abstract pathname.
     *
     * ### Returns:
     * - true if file can be read
     *
     * @method canRead
     * @return {boolean} true if the file can be read
     */
    canRead          : function () {
        return !!this.file.canRead();
    },
    /**
     * ## file.canWrite() : boolean
     *
     * Tests whether the application can modify the file denoted by this abstract pathname.
     *
     * ### Returns:
     * - true if file can be written
     *
     * @method canWrite
     * @return {boolean} true if the file can be written
     */
    canWrite         : function () {
        return !!this.file.canRead();
    },
    /**
     * ## file.compareTo(otherFile) : int
     *
     * Compares two abstract pathnames lexicographically.
     *
     * ### Arguments:
     * - {File} otherFile - other file to compare this one to
     *
     * ### Returns:
     * - zero if the argument is equal to this abstract pathname
     * - less than zero if this abstract pathname is lexicographically less than the argument,
     * - a value greater than zero if this abstract pathname is lexicographically greater than the argument
     *
     * @method compareTo
     * @param {File} other file to compare to
     * @return {int} Zero if the argument is equal to this abstract pathname, a value less than zero if this abstract pathname is lexicographically less than the argument, or a value greater than zero if this abstract pathname is lexicographically greater than the argument
     */
    compareTo        : function (other) {
        return this.file.compareTo(other.file);
    },
    /**
     * ## file.createNewFile() : boolean
     *
     * Atomically creates a new, empty file named by this abstract pathname if and only if a file with this name does not yet exist.
     *
     * ### Returns:
     * - true if the named file does not exist and was successfully created
     * - false if the named file already exists
     *
     * @method createNewFile
     * @return {boolean} true if the named file does not exist and was successfully created; false if the named file already exists
     */
    createNewFile    : function () {
        return !!this.file.createNewFile();
    },
    /**
     * ## file.remove() : boolean
     *
     * Deletes the file or directory denoted by this abstract pathname. If this pathname denotes a directory, then the directory must be empty in order to be deleted.
     *
     * ### Returns:
     * - true if and only if the file or directory is successfully deleted; false otherwise
     *
     * @method remove
     * @return {boolean} true if and only if the file or directory is successfully deleted; false otherwise
     */
    remove           : function () {
        return !!(this.file['delete']());
    },
    /**
     * ## file.deleteOnExit() : file
     *
     * Requests that the file or directory denoted by this abstract pathname be deleted when the virtual machine terminates. Files (or directories) are deleted in the reverse order that they are registered. Invoking this method to delete a file or directory that is already registered for deletion has no effect. Deletion will be attempted only for normal termination of the virtual machine, as defined by the Java Language Specification.
     *
     * Once deletion has been requested, it is not possible to cancel the request. This method should therefore be used with care.
     *
     * @method deleteOnExit
     * @chainable
     */
    deleteOnExit     : function () {
        this.file.deleteOnExit();
        return this;
    },
    /**
     * ## file.exists() : boolean
     *
     * Tests whether the file or directory denoted by this abstract pathname exists.
     *
     * ### Returns:
     * - true if and only if the file or directory denoted by this abstract pathname exists; false otherwise
     *
     * @method exists
     * @return {boolean} true if and only if the file or directory denoted by this abstract pathname exists; false otherwise
     */
    exists           : function () {
        return !!this.file.exists();
    },
    /**
     * ## file.getAbsolutePath() : string
     *
     * Returns the absolute pathname string of this abstract pathname.
     *
     * If this abstract pathname is already absolute, then the pathname string is simply returned as if by the getPath() method. If this abstract pathname is the empty abstract pathname then the pathname string of the current user directory, which is named by the system property user.dir, is returned. Otherwise this pathname is resolved in a system-dependent way. On UNIX systems, a relative pathname is made absolute by resolving it against the current user directory. On Microsoft Windows systems, a relative pathname is made absolute by resolving it against the current directory of the drive named by the pathname, if any; if not, it is resolved against the current user directory.
     *
     * ### Returns:
     * - The absolute abstract pathname denoting the same file or directory as this abstract pathname
     *
     * @method getAbsolutePath
     * @return {string} The absolute abstract pathname denoting the same file or directory as this abstract pathname
     */
    getAbsolutePath  : function () {
        return String(this.file.getAbsolutePath());
    },
    /**
     * ## file.getCanonicalPath() : string
     *
     * Returns the canonical pathname string of this abstract pathname.
     *
     * A canonical pathname is both absolute and unique. The precise definition of canonical form is system-dependent. This method first converts this pathname to absolute form if necessary, as if by invoking the getAbsolutePath() method, and then maps it to its unique form in a system-dependent way. This typically involves removing redundant names such as "." and ".." from the pathname, resolving symbolic links (on UNIX platforms), and converting drive letters to a standard case (on Microsoft Windows platforms).
     *
     * Every pathname that denotes an existing file or directory has a unique canonical form. Every pathname that denotes a nonexistent file or directory also has a unique canonical form. The canonical form of the pathname of a nonexistent file or directory may be different from the canonical form of the same pathname after the file or directory is created. Similarly, the canonical form of the pathname of an existing file or directory may be different from the canonical form of the same pathname after the file or directory is deleted.
     *
     * ### Returns:
     * - The canonical pathname string denoting the same file or directory as this abstract pathname
     *
     * @method getCanonicalPath
     * @return {string} The canonical pathname string denoting the same file or directory as this abstract pathname
     */
    getCanonicalPath : function () {
        return String(this.file.getCanonicalPath());
    },
    /**
     * ## file.getFreeSpace() : number
     *
     * Returns the number of unallocated bytes in the partition named by this abstract path name.
     *
     * The returned number of unallocated bytes is a hint, but not a guarantee, that it is possible to use most or any of these bytes. The number of unallocated bytes is most likely to be accurate immediately after this call. It is likely to be made inaccurate by any external I/O operations including those made on the system outside of this virtual machine. This method makes no guarantee that write operations to this file system will succeed.
     *
     * ### Returns:
     * - The number of unallocated bytes on the partition
     * - 0L if the abstract pathname does not name a partition.
     *
     * This value will be less than or equal to the total file system size returned by getTotalSpace().
     *
     * @method getFreeSpace
     * @return {Number} The number of unallocated bytes on the partition 0L if the abstract pathname does not name a partition. This value will be less than or equal to the total file system size returned by getTotalSpace().
     */
    getFreeSpace     : function () {
        return this.file.getFreeSpace();
    },
    /**
     * ## file.getName() : string
     *
     * Returns the name of the file or directory denoted by this abstract pathname. This is just the last name in the pathname's name sequence. If the pathname's name sequence is empty, then the empty string is returned.
     *
     * ### Returns:
     * - The name of the file or directory denoted by this abstract pathname, or the empty string if this pathname's name sequence is empty
     *
     * @method getName
     * @return {string} The name of the file or directory denoted by this abstract pathname, or the empty string if this pathname's name sequence is empty
     */
    getName          : function () {
        return String(this.file.getName());
    },
    /**
     * ## file.getParent() : string
     *
     * Returns the pathname string of this abstract pathname's parent, or null if this pathname does not name a parent directory.
     *
     * The parent of an abstract pathname consists of the pathname's prefix, if any, and each name in the pathname's name sequence except for the last. If the name sequence is empty then the pathname does not name a parent directory.
     *
     * ### Returns:
     * - The pathname string of the parent directory named by this abstract pathname
     * - null if this pathname does not name a parent
     *
     * @method getParent
     * @return {string} The pathname string of the parent directory named by this abstract pathname, or null if this pathname does not name a parent
     */
    getParent        : function () {
        var p = this.file.getParent();
        return p ? String(p) : null;
    },
    /**
     * ## file.getPath() : string
     *
     * Converts this abstract pathname into a pathname string. The resulting string uses the default name-separator character to separate the names in the name sequence.
     *
     * ### Returns:
     * - The string form of this abstract pathname
     *
     * @method getPath
     * @return {Strring} The string form of this abstract pathname
     */
    getPath          : function () {
        return String(this.file.getPath());
    },
    /**
     * ## file.getTotalSpace() : number
     *
     * Returns the size of the partition named by this abstract pathname.
     *
     * ### Returns:
     * - The size, in bytes, of the partition
     * - 0L if this abstract pathname does not name a partition
     *
     * @method getTotalSpace
     * @return {Number} The size, in bytes, of the partition or 0L if this abstract pathname does not name a partition
     */
    getTotalSpace    : function () {
        return this.file.getTotalSpace();
    },
    /**
     * ## file.getusableSpace() : number
     *
     * Returns the number of bytes available to this virtual machine on the partition named by this abstract pathname. When possible, this method checks for write permissions and other operating system restrictions and will therefore usually provide a more accurate estimate of how much new data can actually be written than getFreeSpace().
     *
     * The returned number of available bytes is a hint, but not a guarantee, that it is possible to use most or any of these bytes. The number of unallocated bytes is most likely to be accurate immediately after this call. It is likely to be made inaccurate by any external I/O operations including those made on the system outside of this virtual machine. This method makes no guarantee that write operations to this file system will succeed.
     *
     * ### Returns:
     * - The number of available bytes on the partition
     * - 0L if the abstract pathname does not name a partition.
     *
     * On systems where this information is not available, this method will be equivalent to a call to getFreeSpace().
     *
     * @method getUsableSpace
     * @return {Number} The number of available bytes on the partition or 0L if the abstract pathname does not name a partition. On systems where this information is not available, this method will be equivalent to a call to getFreeSpace().
     */
    getUsableSpace   : function () {
        return this.file.getUsableSpace();
    },
    /**
     * ## file.isAbsolute() : boolean
     *
     * Tests whether this abstract pathname is absolute. The definition of absolute pathname is system dependent. On UNIX systems, a pathname is absolute if its prefix is "/". On Microsoft Windows systems, a pathname is absolute if its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\".
     *
     * ### Returns:
     * - true if this abstract pathname is absolute, false otherwise
     *
     * @method isAbsolute
     * @return {boolean} true if this abstract pathname is absolute, false otherwise
     */
    isAbsolute       : function () {
        return !!this.file.isAbsolute();
    },
    /**
     * ## file.isDirectory() : boolean
     *
     * Tests whether the file denoted by this abstract pathname is a directory.
     *
     * ### Returns:
     * - true if and only if the file denoted by this abstract pathname exists and is a directory; false otherwise
     *
     * @method isDirectory
     * @return {boolean} true if and only if the file denoted by this abstract pathname exists and is a directory; false otherwise
     */
    isDirectory      : function () {
        return !!this.file.isDirectory();
    },
    /**
     * ## file.isFile() : boolean
     *
     * Tests whether the file denoted by this abstract pathname is a normal file. A file is normal if it is not a directory and, in addition, satisfies other system-dependent criteria. Any non-directory file created by a Java application is guaranteed to be a normal file.
     *
     * ### Returns:
     * - true if and only if the file denoted by this abstract pathname exists and is a normal file; false otherwise
     *
     * @method isFile
     * @return {boolean} true if and only if the file denoted by this abstract pathname exists and is a normal file; false otherwise
     */
    isFile           : function () {
        return !!this.file.isFile();
    },
    /**
     * ## file.isHidden() : boolean
     *
     * Tests whether the file named by this abstract pathname is a hidden file. The exact definition of hidden is system-dependent. On UNIX systems, a file is considered to be hidden if its name begins with a period character ('.'). On Microsoft Windows systems, a file is considered to be hidden if it has been marked as such in the filesystem.
     *
     * ### Returns:
     * - true if and only if the file denoted by this abstract pathname is hidden according to the conventions of the underlying platform
     *
     * @method isHidden
     * @return {boolean} true if and only if the file denoted by this abstract pathname is hidden according to the conventions of the underlying platform
     */
    isHidden         : function () {
        return !!this.file.isHidden();
    },
    /**
     * ## file.lastModified() : number
     *
     * Returns the time that the file denoted by this abstract pathname was last modified.
     *
     * ### Returns:
     * - A long value representing the time the file was last modified, measured in milliseconds since the epoch (00:00:00 GMT, January 1, 1970)
     * - 0L if the file does not exist or if an I/O error occurs
     * @method lastModified
     * @return {int} A long value representing the time the file was last modified, measured in milliseconds since the epoch (00:00:00 GMT, January 1, 1970), or 0L if the file does not exist or if an I/O error occurs
     */
    lastModified     : function () {
        return this.file.lastModified();
    },
    /**
     * ## file.length() : number
     *
     * Returns the length of the file denoted by this abstract pathname. The return value is unspecified if this pathname denotes a directory.
     *
     * ### Returns:
     * - The length, in bytes, of the file denoted by this abstract pathname
     * - 0L if the file does not exist.
     *
     * Some operating systems may return 0L for pathnames denoting system-dependent entities such as devices or pipes.
     *
     * @method size
     * @return {int} The length, in bytes, of the file denoted by this abstract pathname, or 0L if the file does not exist. Some operating systems may return 0L for pathnames denoting system-dependent entities such as devices or pipes.
     */
    size             : function () {
        return this.file['length']();
    },
    /**
     * ## file.makeDirectory(fullPath) : boolean
     *
     * Creates the directory named by this abstract pathname.
     *
     * Optionally, creates the directory named by this abstract pathname, including any necessary but nonexistent parent directories. Note that if this operation fails it may have succeeded in creating some of the necessary parent directories.
     *
     * ### Arguments:
     * - fullPath {boolean} - if true, make all directories along path, if necessary
     *
     * ### Returns:
     * - true if and only if the directory was created; false otherwise.
     *
     * @method makeDirectory
     * @param {Boolean} fullPath - if true, make all directories along path, if necessary
     * @return {Boolean} true if and only if the directory was created; false otherwise.
     */
    makeDirectory    : function (fullPath) {
        return fullPath ? this.file.mkdirs() : this.file.mkdir();
    },
    /**
     * ## file.renameTo(newPath) : boolean
     *
     * Renames the file denoted by this abstract pathname.
     *
     * Many aspects of the behavior of this method are inherently platform-dependent: The rename operation might not be able to move a file from one filesystem to another, it might not be atomic, and it might not succeed if a file with the destination abstract pathname already exists. The return value should always be checked to make sure that the rename operation was successful.
     *
     * ### Arguments:
     * - newPath {string} - the new abstract pathname for the file.
     *
     * ### Returns:
     * - true if and only if the renaming succeeded; false otherwise.
     *
     * @method renameTo
     * @param {string} newPath The new abstract pathname for the file.
     * @return {Boolean} true if and only if the renaming succeeded; false otherwise.
     */
    renameTo         : function (newPath) {
        if (typeof newPath === 'string') {
            newPath = new JavaFile(newPath).getAbsoluteFile();
        }
        return this.file.renameTo(newPath.getAbsolutePath());
    },
    /**
     * ## file.setExecutable(exectuable, ownerOnly) : true
     *
     * Sets the owner's or everybody's execute permission for this abstract pathname.
     *
     * ### Arguments:
     * - executable {boolean} - If true, sets the access permission to allow execute operations; if false to disallow execute operations
     * - ownerOnly {boolean} - If true, the execute permission applies only to the owner's execute permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's execute permission from that of others, then the permission will apply to everybody, regardless of this value.
     *
     * ### Returns:
     * - true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname. If executable is false and the underlying file system does not implement an execute permission, then the operation will fail.
     *
     * @method setExecutable
     * @param {Boolean} executable - If true, sets the access permission to allow execute operations; if false to disallow execute operations
     * @param {Boolean} ownerOnly - If true, the execute permission applies only to the owner's execute permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's execute permission from that of others, then the permission will apply to everybody, regardless of this value.
     * @return {Boolean} true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname. If executable is false and the underlying file system does not implement an execute permission, then the operation will fail.
     */
    setExecutable    : function (executable, ownerOnly) {
        if (ownerOnly !== undefined) {
            return this.file.setExecutable(executable, ownerOnly);
        }
        else {
            return this.file.setExecutable(executable);
        }
    },
    /**
     * ## file.setReadable(readable, ownerOnly) : boolean
     *
     * Sets the owner's or everybody's read permission for this abstract pathname.
     *
     * ### Arguments:
     * - readable {boolean} - If true, sets the access permission to allow read operations; if false to disallow read operations
     * - ownerOnly {boolean} - If true, the read permission applies only to the owner's read permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's read permission from that of others, then the permission will apply to everybody, regardless of this value.
     *
     * ### Returns:
     * - true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname. If readable is false and the underlying file system does not implement a read permission, then the operation will fail.
     *
     * @method setReadable
     * @param {Boolean} readable - If true, sets the access permission to allow read operations; if false to disallow read operations
     * @param {Boolean} ownerOnly - If true, the read permission applies only to the owner's read permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's read permission from that of others, then the permission will apply to everybody, regardless of this value.
     * @return {Boolean} true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname. If readable is false and the underlying file system does not implement a read permission, then the operation will fail.
     */
    setReadable      : function (readable, ownerOnly) {
        if (ownerOnly !== undefined) {
            return this.file.setReadable(readable, ownerOnly);
        }
        else {
            return this.file.setReadable(readable);
        }
    },
    /**
     * ## file.setWritable(writable, ownerOnly) : boolean
     *
     * Sets the owner's or everybody's write permission for this abstract pathname.
     *
     * ### Arguments:
     * - writable {boolean} - If true, sets the access permission to allow write operations; if false to disallow write operations
     * - ownerOnly {boolean} - If true, the write permission applies only to the owner's write permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's write permission from that of others, then the permission will apply to everybody, regardless of this value.
     *
     * ### Returns:
     * - true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname.
     *
     * @method setWritable
     * @param {Boolean} writable - If true, sets the access permission to allow write operations; if false to disallow write operations
     * @param {Boolean} ownerOnly - If true, the write permission applies only to the owner's write permission; otherwise, it applies to everybody. If the underlying file system can not distinguish the owner's write permission from that of others, then the permission will apply to everybody, regardless of this value.
     * @return {Boolean} true if and only if the operation succeeded. The operation will fail if the user does not have permission to change the access permissions of this abstract pathname.
     */
    setWritable      : function (writable, ownerOnly) {
        if (ownerOnly !== undefined) {
            return this.file.setWritable(writable, ownerOnly);
        }
        else {
            return this.file.setWritable(writable);
        }
    },
    /**
     * ## file.setLastModified(timeStampMs) : boolean
     *
     * Sets the last-modified time of the file or directory named by this abstract pathname.
     *
     * All platforms support file-modification times to the nearest second, but some provide more precision. The argument will be truncated to fit the supported precision. If the operation succeeds and no intervening operations on the file take place, then the next invocation of the lastModified() method will return the (possibly truncated) time argument that was passed to this method.
     *
     * ### Arguments:
     * - timestampMs {number} - The new last-modified time, measured in milliseconds since the epoch (00:00:00 GMT, January 1, 1970)
     *
     * ### Returns:
     * - true if and only if the operation succeeded; false otherwise
     *
     * @method setLastModified
     * @param {int} timestampMs - The new last-modified time, measured in milliseconds since the epoch (00:00:00 GMT, January 1, 1970)
     * @return {Boolean} true if and only if the operation succeeded; false otherwise
     */
    setLastModified  : function (timestampMs) {
        return this.file.setLastModified(timeStampMs);
    },
    /**
     * ## file.setReadOnly() : boolean
     *
     * Marks the file or directory named by this abstract pathname so that only read operations are allowed. After invoking this method the file or directory is guaranteed not to change until it is either deleted or marked to allow write access. Whether or not a read-only file or directory may be deleted depends upon the underlying system.
     *
     * ### Returns:
     * - true if and only if the operation succeeded; false otherwise
     *
     * @method setReadOnly
     * @return {Boolean} true if and only if the operation succeeded; false otherwise
     */
    setReadOnly      : function () {
        return this.file.setReadOnly();
    },
    // I/O methods
    /**
     * Tests whether the File is currently open
     *
     * @method isOpened
     * @return {Boolean} true if the File is open
     */
    isOpened         : function () {
        return (this.readerWriter !== null);
    },
    /**
     * ## file.open(options) : void
     *
     * Open the File for reading, writing, or appending.
     *
     * The options object may contain the following values:
     *
     *  charset - name of character set to use while reading or writing<br/>
     *  append - true to append, defaults to false
     *
     * ### Arguments:
     * - options {object} - see above
     *
     * @method open
     * @param {Object} options - object as specified above.
     */
    open             : function (options) {
        if (this.isOpened()) {
            throw new Error('File already open');
        }
        var file = this.file,
            charset = options && options.charset,
            append = options && options.append;

        if (file.exists && !append) {
            this.readerWriter = charset ? new BufferedReader(new InputStreamReader(new FileInputStream(file), charset)) : new BufferedReader(new FileReader(file));
        }
        else {
            if (append && charset) {
                this.readerWriter = new OutputStreamWriter(new FileOutputStream(file, true), charset);
            }
            else if (append) {
                this.readerWriter = new OutputStreamWriter(new FileOutputStream(file, true));
            }
            else if (charset) {
                this.readerWriter = new PrintWriter(file, charset);
            }
            else {
                this.readerWriter = new PrintWriter(file);
            }
        }
    },
    /**
     * ## file.readln() : string
     *
     * Read a line from the file
     *
     * ### Returns:
     * - line read from the file, or null
     *
     * @method readln
     * @return {string} line read from the file, or null
     */
    readln           : function () {
        return this.readerWriter.readln();
    },
    /**
     * ## file.write(what) : void
     *
     * Write a string or array of bytes to the file.
     *
     * ### Arguments:
     * - what {string|byte array} - the string or Java byte array to write
     *
     * @method write
     * @param {String|Array<byte>} the string or Java byte array to write
     */
    write            : function (what) {
        if (what !== null) {
            this.readerWriter.print(what.toString());
        }
    },
    /**
     * ## file.writeln(what) : void
     *
     * Write a string or array of bytes, followed by a newline to the file.
     *
     * ### Arguments:
     * - what {string|byte array} - the string or Java byte array to write

     * @method writeln
     * @param {String|Array<byte>} the string or Java byte array
     */
    writeln          : function (what) {
        this.write(what);
        this.readerWriter.println();
    },
    /**
     * ## file.flush()
     *
     * Flush the file's output stream to disk.
     *
     * @method flush
     */
    flush            : function () {
        this.readerWriter.flush();
    },
    /**
     * ## file.close()
     *
     * Close the file.
     *
     * @method close
     */
    close            : function () {
        this.readerWriter.close();
        this.readerWriter = null;
    },
    /**
     * ## file.readAll() : string
     *
     * Read the file contents as a string.
     *
     * ### Returns:
     * - the entire content of the file as a string
     *
     * @method readAll
     * @return {string} Content of the file
     */
    readAll          : function () {
        var file = this.file,
            body = new ByteArrayOutputStream(),
            stream = new BufferedInputStream(new FileInputStream(file)),
            buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
            count;

        while ((count = stream.read(buf)) > -1) {
            body.write(buf, 0, count);
        }
        stream.close();
        return String(body.toString());
    },
    /**
     * ## file.toByteArray() : java byte array
     *
     * Read file contents in as a byte array.
     *
     * ### Returns:
     * - file contents as a java byte array
     *
     * @method toByteArray
     * @return {Array<byte>} file contents as a java byte array
     */
    toByteArray      : function () {
        var body = new ByteArrayOutputStream();
        var stream = new BufferedInputStream(
            new FileInputStream(this.getAbsolutePath())
        );
        var buf = java.lang.reflect.Array.newInstance(
            java.lang.Byte.TYPE, 1024
        );
        var read;
        while ((read = stream.read(buf)) > -1) {
            body.write(buf, 0, read);
        }
        stream.close();
        stream = null;
        var ret = body.toByteArray();
        body = null;
        return ret;
    },
    /**
     * ## file.writeFile(what, append, encoding) : boolean
     *
     * Write the file from a string.
     *
     * ### Arguments:
     * - what {string} - the string to write to the file
     * - append {boolean} - if true, string is appended to file, otherwise file is overwritten or created with what as content.
     * - enconding {string} - optinal file encoding (utf8, etc.)
     *
     * ### Returns:
     * - true if successful
     *
     * @method writeFile
     * @param {string} s - string to write
     * @param {boolean} append - if true, string is appended to file
     * @param {string} encoding - optional file encoding (utf8, etc.)
     * @return {boolean} true if success
     */
    writeFile        : function (s, append, encoding) {
        var os = new FileOutputStream(this.file, !!append);
        os.write(decaf.toJavaByteArray(s, encoding));
        os.close();
        return true;
    },
    /**
     * Write file contents from a java byte array.
     *
     * @method fromByteArray
     * @param {Array<byte>} bytes - bytes to write to the file.
     */
    fromByteArray    : function (bytes) {
        var stream = new FileOutputStream(this.getAbsolutePath());
        stream.write(bytes);
        stream.close();
    },
    /**
     * ## file.removeDirectory() : chainable
     *
     * Recursively remove a directory.  All files and subdirectories within are removed as well as the directory itself.
     *
     * @method removeDirectory
     * @chainable
     */
    removeDirectory  : function () {
        var file = this.file;
        if (!file.isDirectory()) {
            return;
        }
        var list = file.list();
        for (var i = 0, len = list.length; i < len; i++) {
            var f = new File(file, list[i]);
            if (f.isDirectory()) {
                f.removeDirectory();
            }
            else {
                f.remove();
            }
        }
        file['delete']();
        return this;
    },
    /**
     * ## file.list(pattern) : array of strings
     *
     * Returns an array of strings naming the files and directories in the directory denoted by this abstract pathname that satisfy the optional regular expression.
     *
     * If this abstract pathname does not denote a directory, then this method returns an empty array. Otherwise an array of File objects is returned, one for each file or directory in the directory. Pathnames denoting the directory itself and the directory's parent directory are not included in the result. Each resulting abstract pathname is constructed from this abstract pathname using the File(File, String) constructor. Therefore if this pathname is absolute then each resulting pathname is absolute; if this pathname is relative then each resulting pathname will be relative to the same directory.
     *
     * There is no guarantee that the name strings in the resulting array will appear in any specific order; they are not, in particular, guaranteed to appear in alphabetical order.
     *
     * ### Returns:
     * - An array of abstract pathnames denoting the files and directories in the directory denoted by this abstract pathname. The array will be empty if the directory is empty.
     * - null if this abstract pathname does not denote a directory, or if an I/O error occurs.
     *
     * @method list
     * @param {regex} pattern - optional regex to match filenames against
     * @return {Array} An array of abstract pathnames denoting the files and directories in the directory denoted by this abstract pathname. The array will be empty if the directory is empty. Returns null if this abstract pathname does not denote a directory, or if an I/O error occurs.
     */
    list             : function (pattern) {
        var fileList = this.file.list(),
            result = [];

        decaf.each(fileList, function (f) {
            var fn = String(f.toString());
            if (pattern) {
                if (pattern.test(fn)) {
                    result.push(fn);
                }
            }
            else {
                result.push(fn);
            }
        });
        return result;
    },
    /**
     * ## file.listRecursive(pattern) : array of strings
     *
     * Recursively list a directory.
     *
     * ### Arguments:
     * - pattern {regex} - optional pattern of names to atch
     *
     * ### Returns:
     * - array of filenames, including path (list method does not include path)
     *
     * @ethod listRecursive
     * @param {regex} pattern - regex of names to match
     * @return {Array} array of filenames, including path (list method does not include path)
     */
    listRecursive    : function (pattern) {
        var file = this.file,
            result;
        if (!file.isDirectory()) {
            return false;
        }
        if (!pattern || pattern.test(file.getName())) {
            result = [String(file.getPath().toString())];
        }
        else {
            result = [];
        }
        var list = file.list();
        for (var i = 0, len = list.length; i < len; i++) {
            var f = new File(file, list[i]);
            if (f.isDirectory()) {
                result = result.concat(f.listRecursive(pattern));
            }
            else if (!pattern || pattern.test(list[i])) {
                result.push(String(f.getPath().toString()));
            }
        }
        return result;
    },
    /**
     * ## file.hardCopy(dest)
     *
     * Physically copy a file to a new file, or overwrite an existing file.
     *
     * ### Arguments:
     * - dest {string} - path to copy file to
     *
     * @method hardCopy
     * @param {string} dest - path to copy file to.
     */
    hardCopy         : function (dest) {
        var inStream = new java.io.BufferedInputStream(
            new java.io.FileInputStream(this.file)
        );
        var outStream = new java.io.BufferedOutputStream(
            new java.io.FileOutputStream(dest)
        );
        var buffer = java.lang.reflect.Array.newInstance(
            java.lang.Byte.TYPE, 4096
        );
        var bytesRead = 0;
        while ((bytesRead = inStream.read(buffer, 0, buffer.length)) != -1) {
            outStream.write(buffer, 0, bytesRead);
        }
        outStream.flush();
        inStream.close();
        outStream.close();
    },
    /**
     * ## file.move(dest)
     *
     * Move a file.
     *
     * Normally a "move" operation involves simply renaming the file.  This does not work
     * across file systems on some operating systems.  So we do a hard copy of the file
     * to the destination and remove the original.
     *
     * ### Arguments:
     * - dest {string} - destination path; where file will be moved
     *
     * @method move
     * @param {string} dest - destination where the file will be moved.
     */
    move             : function (dest) {
        // instead of using the standard File method renameTo()
        // do a hardCopy and then remove the source file. This way
        // file locking shouldn't be an issue
        this.hardCopy(dest);
        // remove the source file
        this.file["delete"]();
    }
    /** @private */

});

module.exports = File;
