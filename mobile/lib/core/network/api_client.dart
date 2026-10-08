import 'package:dio/dio.dart';
import '../../config/api_config.dart';

class ApiClient {
  static String? authToken;
  late final Dio dio;

  ApiClient() {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: ApiConfig.timeoutDuration,
        receiveTimeout: ApiConfig.timeoutDuration,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (authToken != null && authToken!.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $authToken';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Centralized network error handling
          return handler.next(e);
        },
      ),
    );
  }
}
