from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ClinicError(Exception):
    """Base for business errors raised by services; mapped to an HTTP status in one place."""

    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class NotFoundError(ClinicError):
    status_code = 404


class ConflictError(ClinicError):
    status_code = 409


class BusinessRuleError(ClinicError):
    status_code = 400


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ClinicError)
    async def handle_clinic_error(_: Request, exc: ClinicError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
