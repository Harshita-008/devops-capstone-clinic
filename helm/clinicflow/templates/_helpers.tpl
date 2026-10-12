{{/* Base name for every resource in the release, e.g. clinicflow-backend. */}}
{{- define "clinicflow.fullname" -}}
{{- if eq .Release.Name .Chart.Name -}}
{{- .Chart.Name -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/* Labels shared by all resources. */}}
{{- define "clinicflow.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: clinicflow
app.kubernetes.io/version: {{ .Values.image.tag | trunc 7 | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Labels a Service uses to select the pods of one component. */}}
{{- define "clinicflow.selectorLabels" -}}
app.kubernetes.io/name: {{ .ctx.Chart.Name }}
app.kubernetes.io/instance: {{ .ctx.Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end -}}

{{/* Image reference, e.g. ghcr.io/harshita-008/clinicflow-backend:<sha>. */}}
{{- define "clinicflow.image" -}}
{{ .ctx.Values.image.registry }}/clinicflow-{{ .component }}:{{ .ctx.Values.image.tag }}
{{- end -}}

{{/* Locked-down container settings shared by the application containers. */}}
{{- define "clinicflow.containerSecurity" -}}
allowPrivilegeEscalation: false
capabilities:
  drop: ["ALL"]
{{- end -}}
