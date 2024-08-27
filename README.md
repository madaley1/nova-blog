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
2. Add to `posts/{date}` directory & push ( i.e. `posts/2024-01-01/blogPost.md` )
3. Run generation script ( currently configured with GH actions, however can be done manually with `npm run generate` )
4. User can visit the new post and enjoy the blog!

## Common Issues

### The actions fail due to a 403
You have to allow actions to make edits to your repo. This can be done in your repo settings at `Settings > Actions > General > Workflow Permissions`. Set it to "Read and Write Permissions" and re-run the action it should work then.


## FAQ

### Are there plans to integrate more common blog features like search or tagging?
No, honestly there aren't plans to take this project any further. This is built to be very opinionated in its simplicity, essentially stripping  blogging down to its bare roots, which is your thoughts displayed on a site, with minor stylings. It's not built to be a super professional platform, but something someone who's never touched HTML/CSS/JS before can quickly spin up, host, and blast their thoughts into the universe. 
