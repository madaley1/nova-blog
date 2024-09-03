import { close, existsSync, mkdir, openSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import showdown from 'showdown';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const postsFolder = join(__dirname, "posts")

const converter = new showdown.Converter();

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getFiles = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => {
      const fileType = dirent.name.split('.')[1]

      return statSync(dirent.path + "/" + dirent.name).isFile() && dirent.name.split('.')[1] === "md"})
    .map(dirent => dirent.path + "/" + dirent.name.split('.').slice(0, -1).join(""));


const translateMdToHTML = (source) => {
  console.log(source)
  if(!existsSync(source)) throw new Error('file does not exist');
  const data = readFileSync(source, "utf8");
  let html = converter.makeHtml(data);
  const images = data.match(/(!\[\[.*\]\])/g);
  console.log(images)
  if(!images) return html
  images.forEach((value, index)=>{
    console.log(value)
    const uri = value.substring(3, value.length - 2);
    const imgTag = `<img src="${uri}"/>`;
    html = html.replace(/(!\[\[.*\]\])/, imgTag);
    console.log(imgTag)
  })
  
  return html
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const navHTML = `
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/posts">Posts</a>
  </nav>
`;

const generatePostsPage = (postPaths) => {
    let linkList = '';
    // generate post links
    for(let i = postPaths.length; i > 0; i--){
      const postPath = postPaths[i - 1];

      const splitPostPath = postPath.split('/');
      
      const postName = splitPostPath[splitPostPath.length - 1];
      const postDate = splitPostPath[splitPostPath.length - 2];
      linkList += `
        <div class="postLink">
          <a href="/${relative('.', postPath)}.html">${capitalizeFirstLetter(postName)} | ${postDate}</a>
        </div>
      `;
    }

    // setup
    const postsFilePath = join(__dirname, "/posts/index.html");
    const currentFile = readFileSync(postsFilePath, { encoding: 'utf8', flag: 'r' });

    // parts construction
    const bodyOfFile = `<section id="posts">${linkList}</section>`;
    const fileParts = currentFile.split(`<section id="posts">`);
    const startOfFile = fileParts[0];
    const secondPartOfFile = fileParts[1].split("</section>")[1];

    // file construction
    const fileContents = startOfFile + bodyOfFile  + secondPartOfFile;

    // regenerate
    if(currentFile !== fileContents) {;
      const fd = openSync(postsFilePath, 'w+');
      writeFileSync(fd, fileContents);
      close(fd);
    } 
}

const generatePostFiles = (postPaths) => {
  // post generation
  for(const postPath of postPaths){
    // setup
    const mdFile = postPath + ".md";
    const splitPath = postPath.split('/');
    const postTitle = splitPath[splitPath.length -1];

    // building parts
    const postHTML = translateMdToHTML(mdFile);
    const beginningOfFile = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${postTitle} | Nova Blog</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="description" content="" />
          <link rel="icon" href="favicon.png">
          <link rel="stylesheet" href="/styles/global.css"/>
          <link rel="stylesheet" href="/styles/posts.css"/>
        </head>
        <body>
          ${navHTML}
          <main>
    `;
    const bodyOfFile = `<section id="post">${postHTML}</section>`;
    const endOfFile = `
          </main>
        </body>
      </html>
    `;

    const fileContents = beginningOfFile + bodyOfFile + endOfFile;

    // regeneration
    const htmlFile = postPath + ".html";
    
    const currentFile = readFileSync(htmlFile, { encoding: 'utf8', flag: 'r' });
    if(currentFile !== fileContents) {
      const fd = openSync(postPath+".html", 'w+');
      writeFileSync(fd, fileContents);
      close(fd);
    }
  }
}

const generateHomePage = (postPaths) => {
  let linkList = '<section id="posts">';

  // generating post list
  for(let i = postPaths.length; i - 1 > -1 && i > postPaths.length - 5; i--){
    const postPath = postPaths[i - 1];


    const splitPostPath = postPath.split('/');
    
    const postName = splitPostPath[splitPostPath.length - 1];
    const postDate = splitPostPath[splitPostPath.length - 2];
    linkList += `
      <div class="postLink">
        <a href="/${relative('.', postPath)}.html">${capitalizeFirstLetter(postName)} | ${postDate}</a>
      </div>
    `;
  }
  linkList += `</section>`;

  // construction setup
  const homeFilePath = join(__dirname, "/index.html");
  const currentFile = readFileSync(homeFilePath, { encoding: 'utf8', flag: 'r' });
  
  // file construction
  const fileParts = currentFile.split(`<section id="posts">`);
  const startOfFile = fileParts[0];
  const secondPartOfFile = fileParts[1].split("</section>")[1];
  const fileContents = startOfFile + linkList  + secondPartOfFile;

  // regeneration
  if(currentFile !== fileContents) {;
    const fd = openSync(homeFilePath, 'w+');
    writeFileSync(fd, fileContents);
    close(fd);
  } 

}

try {
  // ensure posts folder exists
  if(!existsSync(postsFolder)){
    mkdir(postsFolder);
  }

  // get all posts
  const directories = getDirectories(postsFolder);
  const postPaths = [];

  // generate filepaths of posts
  for(const dir of directories){
    const dirSource = join(__dirname, `posts/${dir}`);
    const fileArray = getFiles(dirSource);
    fileArray.forEach((filePath) => postPaths.push(filePath));
  }

  // posts page generation
  generatePostsPage(postPaths);

  // file generation
  generatePostFiles(postPaths);

  // home generation
  generateHomePage(postPaths);
} catch (err) {
  console.error(err);
}

