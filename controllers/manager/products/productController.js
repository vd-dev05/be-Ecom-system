import { imageUpload } from "../../../config/cloudinary.js";
import ManagerModel from "../../../models/shop/managerModel.js";
import ProductModel from "../../../models/shop/productModel.js";

export const uploadProductImages = async (req, res) => {
    try {
        const files = req.files;

        if (!files || !files.mainImage || files.mainImage.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Main image is required",
            });
        }

        // Upload ảnh chính
        const mainImageFile = files.mainImage[0];
        const mainImageB64 = Buffer.from(mainImageFile.buffer).toString("base64");
        const mainImageUrl = "data:" + mainImageFile.mimetype + ";base64," + mainImageB64;
        const mainImageResult = await imageUpload(mainImageUrl);

        // Upload các ảnh phụ 
        let additionalImagesResults = [];
        if (files.additionalImages && files.additionalImages.length > 0) {
            const additionalUploadPromises = files.additionalImages.map((file) => {
                const b64 = Buffer.from(file.buffer).toString("base64");
                const url = "data:" + file.mimetype + ";base64," + b64;
                return imageUpload(url);
            });

            additionalImagesResults = await Promise.all(additionalUploadPromises);
        }

        res.status(200).json({
            success: true,
            message: "Images uploaded successfully!",
            data: {
                mainImage: mainImageResult.secure_url,
                additionalImages: additionalImagesResults.map((result) => result.secure_url),
            },
        });
    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload images",
            error: error.message,
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {
            managerId,
            name,
            description,
            category,
            price,
            salePrice,
            images,
            attributes,
        } = req.body;
        if (!name || !description || !category || !price || !images?.mainImage) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc!",
            });
        }
        if (salePrice > price) {
            return res.status(400).json({
                success: false,
                message: "Giá giảm không được lớn hơn giá gốc!",
            });
        }

        const newProduct = new ProductModel({
            managerId,
            name,
            description,
            category,
            price,
            salePrice: salePrice || 0,
            images,
            attributes,
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Thêm mới sản phẩm thành công !",
            data: newProduct,
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { managerId, productId } = req.params;
        const updates = req.body;

        const manager = await ManagerModel.findById(managerId);
        if (!manager) {
            return res.json({
                success: false,
                message: "Manager not found"
            });
        }
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }
        if (product.managerId.toString() !== managerId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this product.",
            });
        }
        if (updates.salePrice && updates.salePrice > updates.price) {
            return res.status(400).json({
                success: false,
                message: "Sale price cannot be greater than the original price.",
            });
        }
        Object.assign(product, updates);
        await product.save();

        res.json({
            success: true,
            message: "Cập nhật thông tin sản phẩm thành công!",
            data: product,
        });



    } catch (error) {
        console.error("update product error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { managerId, productId } = req.params;

        const manager = await ManagerModel.findById(managerId);
        if (!manager) {
            return res.json({
                success: false,
                message: "Manager not found"
            });
        }
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.json({
                success: false,
                message: "Product not found"
            });
        }
        if (product.managerId.toString() !== managerId) {
            return res.json({
                success: false,
                message: "You are not authorized to delete this product"
            });
        }
        await product.remove();
        res.json({
            success: true,
            message: "Xóa sản phẩm thành công!"
        });

    } catch (error) {
        console.error("delete product error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const fetchProductsByManager = async (req, res) => {
    try {
        const { managerId } = req.params;

        const manager = await ManagerModel.findById(managerId);
        if (!manager) {
            return res.json({
                success: false,
                message: "Manager not found"
            });
        }
        const products = await ProductModel.find({ managerId });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("fetch product by manager error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const fetchProductByDetails = async (req, res) => {
    try {
        const { managerId, productId } = req.params;

        const manager = await ManagerModel.findById(managerId);
        if (!manager) {
            return res.json({
                success: false,
                message: "Manager not found"
            });
        }
        const products = await ProductModel.findOne(
            {
                managerId,
                _id: productId,
            }
        );

        if (!products) {
            return res.json({
                success: false,
                message: "Product not found"
            });
        }
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("fetch product details error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};



