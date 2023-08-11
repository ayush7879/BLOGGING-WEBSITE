//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();
const homeStartingContent = "Welcome to WeBlog, a virtual haven for aspiring writers and passionate bloggers. Unleash your creativity and express your unique voice on our platform. Seamlessly compose and publish your captivating blog posts, sharing your insights, stories, and expertise with the world. Join our community of wordsmiths and let your thoughts paint a masterpiece on this digital canvas of ideas.";
const aboutContent = "Welcome to WeBlog, a dynamic platform designed to empower individuals to share their voices and ideas with the world. Whether you're a seasoned writer or a novice storyteller, this is your space to unleash your creativity and craft compelling blog posts.Whether you want to share your knowledge, inspire others, or ignite meaningful discussions, WeBlog provides the canvas for your thoughts to flourish. Start your blogging journey today and let your creativity soar on WeBlog.";

const contactContent = "We would love to hear from you at WeBlog! If you have any questions, suggestions, or simply want to connect, feel free to reach out. Our team is dedicated to providing you with the best blogging experience.You can email us at ayushpersonal2003@gmail.com or call us at our customer executive number:7879765180";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`${process.env.MONGO_URL}`);

}

const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res){
  try {
    const posts = await Post.find({});
    const formattedPosts = posts.map(function(post) {
      const contentWithLineBreaks = post.content.replace(/\n/g, "<br>");
      const contentWithFormatting = contentWithLineBreaks
        .replace(/%(.*?)%/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return {
        title: post.title,
        content: contentWithFormatting,
        _id:post._id
      };
    });

    res.render("home", {
      startingContent: homeStartingContent,
      posts: formattedPosts
    });
  } catch (err) {
    // res.send("nan");
    res.send("error occured");
    console.log(err);
    // Handle the error appropriately
  }
});



app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});


app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});
let posts=[];
app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  Post.insertMany(post);
  posts.push(post);
  res.redirect("/");

});

app.get("/posts/:postId", async function(req, res){
  try {
    const requestedPostId = req.params.postId;
    console.log(requestedPostId);
    const post = await Post.findById(requestedPostId);
    if (!post) {
      // Handle the case where the post is not found
      return res.status(404).render("error", { error: "Post not found" });
    }

    const contentWithLineBreaks = post.content.replace(/\n/g, "<br>");
    const contentWithFormatting = contentWithLineBreaks
      .replace(/%(.*?)%/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    res.render("post", {
      title: post.title,
      content: contentWithFormatting
    });
  } catch (err) {
    console.log(err);
    // Handle the error appropriately
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
