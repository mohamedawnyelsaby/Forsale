export declare class ProductService {
    getAll(options: {
        page: number;
        limit: number;
    }): Promise<any>;
    getById(id: number): Promise<any>;
    search(params: {
        query?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        page: number;
        limit: number;
    }): Promise<any>;
    getByCategory(category: string, options: {
        page: number;
        limit: number;
    }): Promise<any>;
    create(data: any): Promise<any>;
    update(id: number, userId: number, data: any): Promise<any>;
    delete(id: number, userId: number): Promise<void>;
    getSellerProducts(sellerId: number): Promise<any[]>;
}
//# sourceMappingURL=product.service.d.ts.map