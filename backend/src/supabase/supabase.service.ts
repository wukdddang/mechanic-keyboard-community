import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL과 SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // 사용자 인증 관련 메서드들
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  // 데이터베이스 쿼리 헬퍼 메서드들
  async select(table: string, columns = '*', filters?: any) {
    let query = this.supabase.from(table).select(columns);

    if (filters) {
      Object.keys(filters).forEach((key) => {
        query = query.eq(key, filters[key]);
      });
    }

    const { data, error } = await query;
    return { data, error };
  }

  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select();
    return { data: result, error };
  }

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();
    return { data: result, error };
  }

  async delete(table: string, id: string) {
    const { error } = await this.supabase.from(table).delete().eq('id', id);
    return { error };
  }

  // 파일 업로드 관련 메서드들
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer | File,
    options?: any,
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, options);
    return { data, error };
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(
    bucket: string,
    paths: string[],
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  }
}
