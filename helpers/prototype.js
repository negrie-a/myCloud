var path = require('path')

if (!Array.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    }
}
else {
    console.log("[ERROR] : Array.prototype.replaceAll already exist")
}

if (!Array.prototype.createPath) {
    Array.prototype.createPath = function(c) {
        var target = this;
        var path = "";
        for (var i = 0 ; i < target.length ; i++) {
            if (target[i]) {
                path += c + target[i]
            }
        }
        if (path.length > 0)
            path = path.substr(1);
        return path
    }
}
else {
    console.log("[ERROR] : Array.prototype.createPath already exist")
}

if (!String.prototype.isImage) {
    String.prototype.isImage = function () {
        var suffix = path.extname(this.valueOf())
        suffix = suffix.toLowerCase();

        var suffixImage = [".ani", ".bmp", ".cal", ".fax", ".gif", ".img", ".jbg", ".jpe", ".jpeg", ".jpg", ".mac", ".pmb", ".pcd", ".pcx", ".pct", ".pgm", ".png", ".ppm", ".psd", ".ras", ".tga", ".tiff", ".wmf"]

        if (suffixImage.indexOf(suffix) >= 0)
            return true;
        return false;
    }
}

if (!String.prototype.isMovie) {
    String.prototype.isMovie = function () {
        var suffix = path.extname(this.valueOf())
        suffix = suffix.toLowerCase();

        var suffixImage = [".webm", ".mkv", ".flv", ".flv", ".vob", ".ogv", ".ogg", ".drc", ".gifv", ".mng", ".avi", ".mov", ".qt", ".wmv", ".yuv", ".rm", ".rmvb", ".asf", ".amv", ".mp4", ".m4v", ".m4p", ".mpg", ".mp2", ".mpeg", ".mpe", ".mpv", ".mpg", ".mpeg", ".m2v", ".m4v", "	.svi", ".3gp", ".3g2", ".mxf", ".roq", ".nsv", ".flv", ".f4v", ".f4p", ".f4a", ".f4b"]

        if (suffixImage.indexOf(suffix) >= 0)
            return true;
        return false;
    }
}
