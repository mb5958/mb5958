import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT = `
请分析提供的两张图片。
第一张图片包含一个人物。第二张图片包含一件服装。
您的任务是创建一张新的、逼真的照片，照片中第一个图片里的人物穿着第二个图片里的服装。

关键要求:
1.  **保留服装风格:** 必须将第二张图片中服装的设计、纹理和颜色准确地转移到人物身上。
2.  **精准贴合与垂坠感:** 这是最关键的一点。请调整服装的大小和形状，使其逼真地贴合人物的体型和姿势。服装应该自然垂下，展现出真实生活中应有的褶皱、皱纹和轮廓。服装原有的版型（例如，宽松、紧身、Oversize）应在适应人物身材的基础上得以保持。
3.  **保持人物特征:** 人物的外貌、姿势以及第一张图片中的背景应尽可能保持一致。
4.  **无缝融合:** 最终的图片必须看起来自然可信，就好像人物真的穿着这件衣服一样。避免任何人工或“PS”的痕迹。
5.  **输出:** 只生成最终合成的图片。
`;

const REFINE_PROMPT = `
请将这张合成图片转化为一张单一的、高度逼真的照片。
图片中包含一个人物和一件已经放置好的服装。您的任务是将服装无缝地融合到人物身上，使其看起来就像是真的穿在身上一样。
请重点处理以下细节，以达到照片级的真实感：
1.  **光影与阴影：** 根据环境和人物姿态，为服装添加自然的光照和阴影效果。
2.  **褶皱与垂坠：** 根据人物的身体轮廓和姿势，生成符合布料物理特性的褶皱和垂坠感。
3.  **边缘融合：** 确保服装边缘与人物身体和背景完美融合，没有任何生硬或不自然的痕迹。
最终的输出应该是一张高质量、令人信服的单张照片。请只返回处理后的图片。
`;


export const generateStyledImage = async (personImage: ImageFile, clothingImage: ImageFile): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: personImage.base64,
                            mimeType: personImage.mimeType,
                        },
                    },
                    {
                        inlineData: {
                            data: clothingImage.base64,
                            mimeType: clothingImage.mimeType,
                        },
                    },
                    {
                        text: PROMPT,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data; // Return the base64 string of the generated image
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        throw new Error("生成图片失败。请检查您的 API 密钥和网络连接。");
    }
};

export const generateRefinedImage = async (compositeImage: ImageFile): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: compositeImage.base64,
                            mimeType: compositeImage.mimeType,
                        },
                    },
                    {
                        text: REFINE_PROMPT,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error refining image with Gemini API:", error);
        throw new Error("优化图片失败。请检查您的网络连接。");
    }
};
