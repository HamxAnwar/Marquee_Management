{
  description = "Marquee Management Platform Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        pythonPackages = ps: with ps; [
          # Django and core
          django
          djangorestframework
          python-decouple
          setuptools

          # Database
          psycopg2
          mysqlclient
          dj-database-url

          # Cache and Redis
          redis
          django-redis

          # Additional packages
          pillow
          django-cors-headers
          django-extensions
          coreapi
          requests
          django-filter
          djangorestframework-simplejwt
          stripe
        ];

        pythonWithPackages = pkgs.python311.withPackages pythonPackages;

      in {
        devShell = pkgs.mkShell {
          buildInputs = [
            pythonWithPackages
            pkgs.nodejs_20
            pkgs.postgresql
            pkgs.redis
            pkgs.git
          ];

          shellHook = ''
            echo "🚀 Entering Marquee Management Platform Nix Environment"
            echo "Python: $(python --version)"
            echo "Node.js: $(node --version)"
            echo "NPM: $(npm --version)"
            echo ""
            echo "Available commands:"
            echo "  ./start-dev-nix.sh  - Start development servers"
            echo "  cd backend && python manage.py runserver"
            echo "  cd frontend && npm run dev"
            echo ""
          '';
        };
      });
}