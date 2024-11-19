import { combineReducers } from 'redux';
import LoginReducer from './login';
import GemReducer from './gem'
import CollectionReducer from './collection';
import UserReducer from './user';
import TagReducer from './tags';
import DomainReducer from './domain';
import SubcollectionReducer from './subcollection'
import UploadReducer from './upload';
import HighlightsReducer from './highlight';
import CodesReducer from './code';
import ImagesReducer from './image';
import PdfReducer from './pdf';
import AppReducer from './app'
import AudioReducer from './audios'
import VideoReducer from './videos'
import SidebarApplicationReducer from './customApplication'
import searchReducer from './search'
import AIBrandsReduces from './ai-brands'

const rootReducer = combineReducers({
    login: LoginReducer,
    gem: GemReducer,
    search: searchReducer,
    collection: CollectionReducer,
    subcollection: SubcollectionReducer,
    user: UserReducer,
    tags: TagReducer,
    domain: DomainReducer,
    upload: UploadReducer,
    highlights: HighlightsReducer,
    codes: CodesReducer,
    images: ImagesReducer,
    pdfHighlights: PdfReducer,
    audios: AudioReducer,
    videos: VideoReducer,
    sidebarApplications: SidebarApplicationReducer,
    app: AppReducer,
    aiBrands: AIBrandsReduces
});

export default rootReducer;