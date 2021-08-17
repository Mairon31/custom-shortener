import * as mongoose from 'mongoose'
import IShortener from './interface'

const shortenerSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String,
    shortId: String,
    clicks: Number
})

const shortenerModel = mongoose.model<IShortener & mongoose.Document>('Shortener', shortenerSchema);
 
export default shortenerModel;