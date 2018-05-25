"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Bluebird = require("bluebird");
const rimraf = require("rimraf");
exports.tmpTestDir = path.join(__dirname, '../.tmp');
exports.dataDir = `${exports.tmpTestDir}/.data`;
exports.fixturesDir = path.join(__dirname, '../resource/fixtures/');
class User {
    static setMapping(mapping) {
        mapping.forProperty('id').increments().primary();
        mapping.forProperty('username').field({ type: 'string' });
        mapping.forProperty('password').field({ type: 'string' });
        mapping.forProperty('posts').oneToMany({ targetEntity: Post, mappedBy: 'author' });
    }
}
exports.User = User;
class Post {
    static setMapping(mapping) {
        mapping.forProperty('id').increments().primary();
        mapping.forProperty('title').field({ type: 'string' });
        mapping.forProperty('content').field({ type: 'text' });
        mapping.forProperty('author').manyToOne({ targetEntity: User, inversedBy: 'posts' });
    }
}
exports.Post = Post;
class Pet {
    static setMapping(mapping) {
        mapping.forProperty('id').increments().primary();
        mapping.forProperty('name').field({ type: 'string' });
    }
}
exports.Pet = Pet;
function getType(bypassLifecyclehooks) {
    return bypassLifecyclehooks ? 'nolifecycle' : 'lifecycle';
}
exports.getType = getType;
function rmDataDir() {
    const rmDir = Bluebird.promisify(rimraf);
    return rmDir(exports.dataDir);
}
exports.rmDataDir = rmDataDir;
