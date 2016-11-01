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
