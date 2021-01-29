const express = require("express");
const app = express.Router();
const requestIp = require("request-ip");

const { validateComment } = require("../../validator")

const PostsModel = require("../../model/posts")
const CommentSchema = require("../../model/comments");

app.get("/", async (req, res, next) => {
    try {
        const comments = await CommentSchema.find().populate("user");
        const clientIp = requestIp.getClientIp(req);

        if (comments.length > 0) {
            res.status(200).send(comments);
            console.log("\x1b[32m", clientIp + " did GET/comments");
        } else {
            res
                .status(404)
                .send(
                    "404, not found. Could it be that there aren't any comments in the databse?"
                );
            console.log(
                "\x1b[33m%s\x1b[0m",
                clientIp + " did GET/comments but encountered 404"
            );
        }
    } catch (err) {
        console.log("\x1b[31m", err);
        next(err);
    }
});

app.get("/:id", async (req, res, next) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        const comment = await CommentSchema.findById(req.params.id).populate("user");
        if (comment) {
            res.status(200).send(comment);
            console.log("\x1b[32m", clientIp + " did GET/comments/" + req.params.id);
        } else {
            res
                .status(404)
                .send("404, not found. Wrong id or the elemnt doesn't exist?");
            console.log(
                "\x1b[33m%s\x1b[0m",
                clientIp + " did GET/comments/" + req.params.id + " but encountered 404"
            );
        }
    } catch (err) {
        console.log("\x1b[31m", err);
        next(err);
    }
});

app.post("/:postId/:userId", validateComment, async (req, res, next) => {
    try {
        const newComment = new CommentSchema({
            user: req.params.userId,
            ...req.body
        });
        const { _id } = await newComment.save();
        await PostsModel.findByIdAndUpdate(
            req.params.postId,
            {
                $push: {
                    comments: [{
                        _id: _id
                    }]
                }
            })

        if (_id) {
            res.status(200).send("Created! here's the id of the comment: " + _id);
        } else {
            res.send("Unknown error");
            next();
        }
    } catch (err) {
        console.log("\x1b[31m", err);
        next(err);
    }
});

app.put("/:id", validateComment, async (req, res, next) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        const modifiedComment = await CommentSchema.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                runValidators: true,
                new: true,
            }
        );
        console.log();
        if (modifiedComment) {
            res.status(200).send("comment changed, new id:" + modifiedComment._id);
            console.log(
                "\x1b[32m",
                clientIp + " modified a comment, id: " + req.params.id
            );
        } else {
            res.send("Unknown error, maybe you mistaken the id?");
            console.log(
                "\x1b[33m%s\x1b[0m",
                clientIp +
                " tried to modify a comment but encountered an error, id: " +
                req.params.id
            );
            next();
        }
    } catch (err) {
        console.log("\x1b[31m", err);
        next(err);
    }
});

app.delete("/:id", async (req, res, next) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        const DeletedComment = await CommentSchema.findByIdAndDelete(req.params.id);
        if (DeletedComment) {
            res.status(200).send("comment deleted!");
            console.log(
                "\x1b[32m",
                clientIp + " deleted a comment, id: " + req.params.id
            );
        } else {
            res.send("Unknown error, maybe you mistaken the id?");
            console.log(
                "\x1b[33m%s\x1b[0m",
                clientIp +
                " tried to delete a comment but encountered an error, id: " +
                req.params.id
            );
            next();
        }
    } catch (err) {
        console.log("\x1b[31m", err);
        next(err);
    }
});

module.exports = app;
