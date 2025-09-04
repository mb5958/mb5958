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