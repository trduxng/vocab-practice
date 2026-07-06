package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	ID          int64    `json:"id"`
	FullName    string   `json:"fullName"`
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return []byte("default-secret")
	}
	return []byte(secret)
}

func VerifyToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Thiếu token xác thực"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims := &UserClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return getJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			if strings.Contains(err.Error(), "expired") {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Token đã hết hạn, vui lòng đăng nhập lại"})
				return
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Token không hợp lệ"})
			return
		}

		c.Set("user", claims)
		c.Next()
	}
}

func RequirePermission(codes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, exists := c.Get("user")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Chưa xác thực"})
			return
		}

		user := claims.(*UserClaims)
		userPerms := make(map[string]bool)
		for _, p := range user.Permissions {
			userPerms[strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(p), "-", "_"))] = true
		}

		for _, code := range codes {
			normalized := strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(code), "-", "_"))
			if userPerms[normalized] {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Không có quyền: " + strings.Join(codes, " / ")})
	}
}
