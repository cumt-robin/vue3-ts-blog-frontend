/**
 * @author: Tusi
 * @description: DTO
 */
import { PlainObject } from "./base";

export interface RecordDTO extends PlainObject {
    id: number;
}

export interface CategoryCamelCaseDTO extends RecordDTO {
    categoryName: string;
}
export interface TagCamelCaseDTO extends RecordDTO {
    tagName: string;
}
export interface ArticleDTO extends RecordDTO {
    article_name: string;
    article_text: string;
    author: string;
    poster: string;
    summary: string;
    read_num: number;
    create_time: string;
    private: 0 | 1;
    tags: TagCamelCaseDTO[];
    categories: CategoryCamelCaseDTO[];
}

export interface CategoryDTO extends RecordDTO {
    category_name: string;
    poster: string;
}

export interface TagDTO extends RecordDTO {
    tag_name: string;
}

export interface ReplyDTO extends RecordDTO {
    reply_name: string;
    nick_name: string;
    avatar: string;
    create_time: string;
    content: string;
    email: string;
    jump_url: string;
    site_url: string;
    article_id: number;
    article_name: string;
}

export interface CommentDTO extends RecordDTO {
    site_url: string;
    nick_name: string;
    avatar: string;
    create_time: string;
    content: string;
    article_id: number;
    article_name: string;
    email: string;
    jump_url: string;
    replies: ReplyDTO[];
}

export interface CommentUserInfo extends PlainObject {
    email: string;
    nick_name: string;
    site_url: string;
}

export interface UserDTO extends RecordDTO {
    role_id: number;
    role_name: string;
    user_name: string;
    avatar: string;
    last_login_time: string;
}
