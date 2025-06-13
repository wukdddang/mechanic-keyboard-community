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
  async signUp(email: string, password: string, metadata?: any) {
    console.log('Supabase signUp 시도:', { email, password: '****', metadata });

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        ...(metadata ? { data: metadata } : {}),
        emailRedirectTo: 'http://192.168.10.98:4000/auth/callback',
      },
    });

    if (error) {
      console.error('Supabase signUp 에러 상세:', {
        message: error.message,
        status: error.status,
        name: error.name,
        cause: error.cause,
        details: JSON.stringify(error, null, 2),
      });
    } else {
      console.log('Supabase signUp 성공:', {
        userId: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at,
        metadata: data.user?.user_metadata,
      });
    }

    return { data, error };
  }

  async signIn(email: string, password: string) {
    console.log('Supabase signIn 시도:', { email, password: '****' });

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase signIn 에러 상세:', {
        message: error.message,
        status: error.status,
        name: error.name,
        cause: error.cause,
        details: JSON.stringify(error, null, 2),
      });
    } else {
      console.log('Supabase signIn 성공:', {
        userId: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at,
        lastSignIn: data.user?.last_sign_in_at,
      });
    }

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

  async getUserFromToken(accessToken: string) {
    // 임시 클라이언트 생성하여 토큰으로 사용자 정보 조회
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    const tempClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await tempClient.auth.getUser();

    if (error) {
      console.error('토큰으로 사용자 조회 실패:', error);
      return null;
    }

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

  async insertWithAuth(table: string, data: any, accessToken: string) {
    // 임시 클라이언트를 생성하여 사용자 토큰으로 인증된 요청 수행
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    const tempClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: result, error } = await tempClient
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

  async resendConfirmation(email: string) {
    console.log('이메일 확인 재발송 시도:', { email });

    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'http://192.168.10.98:4000/auth/callback',
      },
    });

    if (error) {
      console.error('이메일 재발송 에러:', error);
    } else {
      console.log('이메일 재발송 성공:', data);
    }

    return { data, error };
  }
}
