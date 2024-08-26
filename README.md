# Nova Blog

A static page blog platform which was inspired by [Bear Blog](https://bearblog.dev).

## About

I wanted a simple self-hosted blog platform to be hosted on github pages and that I could just push markdown files to for posting. No GUI needed, just add file and push, then go to the site and see your post publicly.

## Deploying to github pages

Luckily deployment is incredibly simple, just clone this repo, push it to a github pages repo, and you should be good to go!
There is a `docker-compose.yml` file in this repo if you wanted to play around with it localloy as well!

## Posting to your blog

The general workflow is as follows:
1. Write MD file
2. Add to /\{date\}/posts directory & push
3. Run generation script (ideally gh actions does this)
4. Post Link is added to post list & home
5. HTML is generated for page
6. User can visit post and enjoy the blog!
