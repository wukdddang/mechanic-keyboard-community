import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Authorization 헤더에서 토큰 추출
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('인증 토큰이 없습니다.');
      }

      const token = authHeader.substring(7); // 'Bearer ' 제거

      // Supabase로 토큰 검증 및 사용자 정보 조회
      const user = await this.supabaseService.getUserFromToken(token);

      if (!user) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // 프로필 정보 조회
      const { data: profiles, error } = await this.supabaseService.select(
        'profiles',
        '*',
        { id: user.id },
      );

      if (error) {
        console.error('프로필 조회 에러:', error);
      }

      let userProfile;
      if (!profiles || profiles.length === 0) {
        console.log('⚠️ 프로필이 없는 사용자:', user.id);
        // 프로필이 없어도 기본 사용자 정보는 반환
        userProfile = {
          id: user.id,
          username: user.email?.split('@')[0] || 'Unknown',
          email: user.email,
        };
      } else {
        userProfile = profiles[0];
      }

      console.log('✅ JWT 인증 성공:', {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
      });

      // request 객체에 사용자 정보 추가
      request.user = userProfile;

      return true;
    } catch (error) {
      console.error('JWT 토큰 검증 실패:', error);
      throw new UnauthorizedException('인증에 실패했습니다.');
    }
  }
}
