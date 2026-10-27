package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type NuevaCita struct {
	Propietario string `json:"propietario"`
	Celular     string `json:"celular"`
	Mascota     string `json:"mascota"`
	Edad        string `json:"edad"`
	Tipo        string `json:"tipo"`
	Sexo        string `json:"sexo"`
	Motivo      string `json:"motivo"`
}

type Cita struct {
	ID          int64     `json:"id"`
	Propietario string    `json:"propietario"`
	Celular     string    `json:"celular"`
	Mascota     string    `json:"mascota"`
	Edad        string    `json:"edad"`
	Tipo        string    `json:"tipo"`
	Sexo        string    `json:"sexo"`
	Motivo      string    `json:"motivo"`
	Estado      string    `json:"estado"`
	FechaCita   *string   `json:"fecha_cita"`
	HoraCita    *string   `json:"hora_cita"`
	CreatedAt   time.Time `json:"created_at"`
}

type CambioEstado struct {
	Estado string `json:"estado"`
}

type Programacion struct {
	FechaCita string `json:"fecha_cita"`
	HoraCita  string `json:"hora_cita"`
}

var db *pgxpool.Pool

func responderJSON(w http.ResponseWriter, codigo int, datos any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(codigo)
	_ = json.NewEncoder(w).Encode(datos)
}

func responderError(w http.ResponseWriter, codigo int, mensaje string) {
	responderJSON(w, codigo, map[string]string{"error": mensaje})
}

func permitirCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origen := r.Header.Get("Origin")

		if origen == "http://localhost:5173" ||
			origen == "http://127.0.0.1:5173" {
			w.Header().Set("Access-Control-Allow-Origin", origen)
			w.Header().Set("Vary", "Origin")
			w.Header().Set(
				"Access-Control-Allow-Methods",
				"GET, POST, PATCH, DELETE, OPTIONS",
			)
			w.Header().Set(
				"Access-Control-Allow-Headers",
				"Content-Type, Authorization",
			)
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func decodificarJSON(r *http.Request, destino any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(destino)
}

func validarNuevaCita(c NuevaCita) bool {
	return strings.TrimSpace(c.Propietario) != "" &&
		strings.TrimSpace(c.Celular) != "" &&
		strings.TrimSpace(c.Mascota) != "" &&
		strings.TrimSpace(c.Edad) != "" &&
		strings.TrimSpace(c.Tipo) != "" &&
		strings.TrimSpace(c.Sexo) != "" &&
		strings.TrimSpace(c.Motivo) != ""
}

// POST /citas
func crearCita(w http.ResponseWriter, r *http.Request) {
	var c NuevaCita

	if err := decodificarJSON(r, &c); err != nil {
		responderError(w, http.StatusBadRequest, "Los datos enviados no son válidos.")
		return
	}

	if !validarNuevaCita(c) {
		responderError(w, http.StatusBadRequest, "Completa todos los campos.")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	_, err := db.Exec(ctx, `
		INSERT INTO citas
			(propietario, celular, mascota, edad, tipo, sexo, motivo)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`,
		strings.TrimSpace(c.Propietario),
		strings.TrimSpace(c.Celular),
		strings.TrimSpace(c.Mascota),
		strings.TrimSpace(c.Edad),
		strings.TrimSpace(c.Tipo),
		strings.TrimSpace(c.Sexo),
		strings.TrimSpace(c.Motivo),
	)

	if err != nil {
		log.Printf("Error al crear cita: %v", err)
		responderError(w, http.StatusInternalServerError, "No se pudo registrar la cita.")
		return
	}

	responderJSON(w, http.StatusCreated, map[string]string{
		"mensaje": "Solicitud registrada correctamente.",
	})
}

// GET /citas
func listarCitas(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	filas, err := db.Query(ctx, `
		SELECT
    id,
    propietario,
    celular,
    mascota,
    edad,
    tipo,
    sexo,
    motivo,
    estado,
    fecha_cita::text,
    hora_cita::text,
    created_at
FROM citas
ORDER BY created_at DESC
	`)
	if err != nil {
		log.Printf("Error al consultar citas: %v", err)
		responderError(w, http.StatusInternalServerError, "No se pudieron consultar las citas.")
		return
	}
	defer filas.Close()

	citas := make([]Cita, 0)

	for filas.Next() {
		var c Cita

		err := filas.Scan(
			&c.ID,
			&c.Propietario,
			&c.Celular,
			&c.Mascota,
			&c.Edad,
			&c.Tipo,
			&c.Sexo,
			&c.Motivo,
			&c.Estado,
			&c.FechaCita,
			&c.HoraCita,
			&c.CreatedAt,
		)

		if err != nil {
			log.Printf("Error al leer cita: %v", err)
			responderError(w, http.StatusInternalServerError, "Error al leer los datos de las citas.")
			return
		}

		citas = append(citas, c)
	}

	if err := filas.Err(); err != nil {
		log.Printf("Error al recorrer citas: %v", err)
		responderError(w, http.StatusInternalServerError, "Error al consultar las citas.")
		return
	}

	responderJSON(w, http.StatusOK, citas)
}

func obtenerID(r *http.Request) (int64, error) {
	partes := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	if len(partes) < 2 || partes[0] != "citas" {
		return 0, strconv.ErrSyntax
	}

	id, err := strconv.ParseInt(partes[1], 10, 64)
	if err != nil || id <= 0 {
		return 0, strconv.ErrSyntax
	}

	return id, nil
}

// PATCH /citas/{id}/estado
func actualizarEstado(w http.ResponseWriter, r *http.Request) {
	id, err := obtenerID(r)
	if err != nil {
		responderError(w, http.StatusBadRequest, "El identificador de la cita no es válido.")
		return
	}

	var cambio CambioEstado
	if err := decodificarJSON(r, &cambio); err != nil {
		responderError(w, http.StatusBadRequest, "Los datos enviados no son válidos.")
		return
	}

	if cambio.Estado != "pendiente" &&
		cambio.Estado != "aceptada" &&
		cambio.Estado != "rechazada" {
		responderError(w, http.StatusBadRequest, "El estado indicado no es válido.")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	var tagErr error

	if cambio.Estado == "pendiente" {
		var tag interface{ RowsAffected() int64 }
		tag, tagErr = db.Exec(ctx, `
			UPDATE citas
			SET estado = $1, fecha_cita = NULL, hora_cita = NULL
			WHERE id = $2
		`, cambio.Estado, id)
		if tagErr == nil && tag.RowsAffected() == 0 {
			responderError(w, http.StatusNotFound, "La cita no existe.")
			return
		}
	} else {
		tag, err := db.Exec(ctx, `
			UPDATE citas SET estado = $1 WHERE id = $2
		`, cambio.Estado, id)
		if err != nil {
			tagErr = err
		} else if tag.RowsAffected() == 0 {
			responderError(w, http.StatusNotFound, "La cita no existe.")
			return
		}
	}

	if tagErr != nil {
		log.Printf("Error al actualizar estado: %v", tagErr)
		responderError(w, http.StatusInternalServerError, "No se pudo actualizar el estado.")
		return
	}

	responderJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Estado actualizado correctamente.",
	})
}

// PATCH /citas/{id}/programar
func programarCita(w http.ResponseWriter, r *http.Request) {
	id, err := obtenerID(r)
	if err != nil {
		responderError(w, http.StatusBadRequest, "El identificador de la cita no es válido.")
		return
	}

	var p Programacion
	if err := decodificarJSON(r, &p); err != nil {
		responderError(w, http.StatusBadRequest, "Los datos enviados no son válidos.")
		return
	}

	if _, err := time.Parse("2006-01-02", p.FechaCita); err != nil {
		responderError(w, http.StatusBadRequest, "La fecha debe tener formato AAAA-MM-DD.")
		return
	}

	if _, err := time.Parse("15:04", p.HoraCita); err != nil {
		responderError(w, http.StatusBadRequest, "La hora debe tener formato HH:MM.")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	tag, err := db.Exec(ctx, `
		UPDATE citas
		SET fecha_cita = $1, hora_cita = $2, estado = 'aceptada'
		WHERE id = $3
	`, p.FechaCita, p.HoraCita, id)

	if err != nil {
		log.Printf("Error al programar cita: %v", err)
		responderError(w, http.StatusInternalServerError, "No se pudo programar la cita.")
		return
	}

	if tag.RowsAffected() == 0 {
		responderError(w, http.StatusNotFound, "La cita no existe.")
		return
	}

	responderJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Cita programada correctamente.",
	})
}

// DELETE /citas/{id}
func eliminarCita(w http.ResponseWriter, r *http.Request) {
	id, err := obtenerID(r)
	if err != nil {
		responderError(w, http.StatusBadRequest, "El identificador de la cita no es válido.")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	tag, err := db.Exec(ctx, `DELETE FROM citas WHERE id = $1`, id)
	if err != nil {
		log.Printf("Error al eliminar cita: %v", err)
		responderError(w, http.StatusInternalServerError, "No se pudo eliminar la cita.")
		return
	}

	if tag.RowsAffected() == 0 {
		responderError(w, http.StatusNotFound, "La cita no existe.")
		return
	}

	responderJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Cita eliminada correctamente.",
	})
}

func rutas() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			responderError(w, http.StatusMethodNotAllowed, "Método no permitido.")
			return
		}
		responderJSON(w, http.StatusOK, map[string]string{
			"estado":   "ok",
			"supabase": "conectado",
		})
	})

	mux.HandleFunc("/citas", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			crearCita(w, r)
		case http.MethodGet:
			listarCitas(w, r)
		default:
			responderError(w, http.StatusMethodNotAllowed, "Método no permitido.")
		}
	})

	mux.HandleFunc("/citas/", func(w http.ResponseWriter, r *http.Request) {
		partes := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(partes) == 3 && partes[2] == "estado" &&
			r.Method == http.MethodPatch {
			actualizarEstado(w, r)
			return
		}

		if len(partes) == 3 && partes[2] == "programar" &&
			r.Method == http.MethodPatch {
			programarCita(w, r)
			return
		}

		if len(partes) == 2 && r.Method == http.MethodDelete {
			eliminarCita(w, r)
			return
		}

		responderError(w, http.StatusNotFound, "Ruta no encontrada.")
	})

	return permitirCORS(mux)
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró .env; se usarán las variables del sistema")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("Falta configurar DATABASE_URL en .env")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	db, err = pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("No se pudo crear la conexión: %v", err)
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("No se pudo conectar a Supabase: %v", err)
	}

	log.Println("Conexión con Supabase establecida")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend disponible en http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, rutas()))
}
