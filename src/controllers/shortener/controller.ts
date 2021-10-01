import * as express from 'express'
import { Request, Response } from 'express'
import * as rateLimit from 'express-rate-limit'
import IControllerBase from 'interfaces/IControllerBase.interface'
import { existsSync, readFileSync, watchFile, writeFileSync } from 'fs'
import * as path from 'path'
import shortenerModel from './model'
import IShortener from './interface';


class ShortenerController implements IControllerBase {
    public path = '/'
    public router = express.Router()
    
    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/', this.index)
        this.router.get('/sitemap.txt', this.sitemap)
       // this.router.get('/:shortcode', this.get)
        this.router.get('/register', this.register)
        this.router.post('/create', this.ratelimit, this.create)
        this.router.post('/edit', this.ratelimit, this.edit)
        this.router.post('/delete', this.ratelimit, this.remove)
        this.router.get('/login', this.login)
    }

    private generateRandomUrl(length: Number) {
        const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let urlChars = "";
        for (var i = 0; i < length; i++) {
            urlChars += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        }     
        return urlChars;
    }

   ratelimit = rateLimit({
   windowMs: 15000,
   max: 4,
   statusCode: 429,
   message: {
    status: 429,
    error: 'Ratelimit',
    success: false,
    message: "You are doing that too much"
   }
})

    index = async(req: Request, res: Response) => {

        res.render('home/index')
    }

    login = async(req: Request, res: Response) => {
      res.render('home/login')
    }

  register = async(req: Request, res: Response) => {
      res.render('home/register')
    }

    get = async(req: Request, res: Response) => {
        
        const { shortcode } = req.params

        const data: IShortener = {
            shortUrl: shortcode
        }

        const urlInfo = await shortenerModel.findOne(data)
    
        if (urlInfo) {
           // res.redirect(302, urlInfo.longUrl)
          const countClick = urlInfo.clicks + 1 
             const dataClick: IShortener = {
              clicks: countClick
            }
           
          res.redirect(302, urlInfo.longUrl);
          const saveClick = await shortenerModel.updateOne(dataClick)  
        } else {
            res.render('home/404')
        }
    }
    
    
    create = async(req: express.Request, res: express.Response) => {

        const { url } = req.body
        const verifyUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)
           if (!url.match(verifyUrl)) {
          return res.json({
            success: false,
            message: 'Your URL is invalid',
            url: null,
            id: null
          })
        }
           
        const data: IShortener = {
            longUrl: url
        }

        let urlInfo = await shortenerModel.findOne(data)
        
            var shortCode: string
            var shortCodeId: string
            do{
                shortCode = this.generateRandomUrl(5)
                shortCodeId = this.generateRandomUrl(16)
                urlInfo = await shortenerModel.findOne({shortUrl: shortCode})
            }while(urlInfo !== null)

            const shortData: IShortener = {
                longUrl: url,
                shortUrl: shortCode,
                shortId: shortCodeId,
                clicks: 0
            }
    
            const shortenerData = new shortenerModel(shortData)
    
            urlInfo = await shortenerData.save()
       
        res.json({
            success: true,
            message: 'URL Shortened',
            url: urlInfo.shortUrl,
            id: urlInfo.shortId
        }) 
    }
    
    remove = async(req: express.Request, res: express.Response) => {
      const { id, url } = req.body
      const shortData: IShortener = {
        shortId: id
      }
      let urlRemoved = await shortenerModel.findOneAndDelete(shortData)
       res.json({
        success: true,
        message: "Shortened URL was removed",
        url: null,
        id: null
      })
    }
    
    sitemap = async(req: express.Request, res: express.Response) => {
       let urlist = 'https://clot.me\n'
       let shortener = await shortenerModel.find().exec()
       let smp = shortener.forEach(e => { 
         urlist += `https://clot.me/${e.shortUrl}\n`})
       writeFileSync(path.join('./public/assets/sitemap.txt'), urlist) 
       res.sendFile(path.resolve('./public/assets/sitemap.txt'))
    }
    
    edit = async(req: express.Request, res: express.Response) => {
      const { url, id } = req.body
      let newUrl = url.replace(/[^a-zA-Z0-9]/g, '-')
      if(newUrl.length < 1) {
      return res.json({
        success: false,
        message: 'Your custom URL must be longer',
        url: null,
        id: null
      })
      } 
      const shortData: IShortener = {
        shortId: id
      }
      let urlInfo = await shortenerModel.findOne(shortData)
      
      if(urlInfo) {
        const customShortUrl: IShortener = {
          shortUrl: newUrl
        }
        let checkUrl = await shortenerModel.findOne(customShortUrl)
        if(checkUrl) {
          res.json({
          success: false,
          message: 'Custom URL is already in use',
          url: null,
          id: null
        })
        } else {
        
        const customInfo: IShortener = {
          shortUrl: newUrl
        }
      const customData = await urlInfo.updateOne(customInfo)
        
       return res.json({
          success: true,
          message: 'URL changed',
          url: newUrl,
          id
        }) 
        }
      } else {
        res.json({
          success: false,
          message: 'Invalid Shortened URL',
          url: null,
          id: urlInfo.shortId
        }) 
      }
}
}

export default ShortenerController