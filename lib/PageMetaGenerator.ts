import { IPage, IPageMetaInfo } from "./..";

class PageMetaGenerator {
    public async generate(page: IPage): Promise<IPageMetaInfo> {
        const title = page.frames.map((frame) => frame.data ? frame.data.title : undefined)
            .filter((value) => !!value).join("::");
        return {
            title,
        };
    }
}
export default PageMetaGenerator;
