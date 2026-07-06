package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func ReverseProxy(target *url.URL) gin.HandlerFunc {
	rp := httputil.NewSingleHostReverseProxy(target)

	defaultDirector := rp.Director
	rp.Director = func(req *http.Request) {
		defaultDirector(req)
		req.Header.Set("X-Forwarded-Host", req.Host)
		req.Host = target.Host
	}

	return func(c *gin.Context) {
		rp.ServeHTTP(c.Writer, c.Request)
	}
}
