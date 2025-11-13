<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_publication';

    protected $fillable = [
        'titre','contenu','type','date_publication','source','categorie','statut',
        'fichier','type_fichier','nom_fichier_original','auteur','id_utilisateur',
        'total_reactions','vues'
    ];

    protected $casts = [
        'date_publication' => 'datetime',
    ];

    // Relation avec l'utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    // Accessor pour l'URL complète du fichier
    public function getFichierUrlAttribute()
    {
        if (!$this->fichier) {
            return null;
        }

        if (str_starts_with($this->fichier, 'http')) {
            return $this->fichier;
        }

        return asset('storage/' . $this->fichier);
    }

    // Méthode pour déterminer le type de fichier basé sur l'extension
    public function getTypeFichierFromName($fileName)
    {
        if (!$fileName) return null;

        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        } else {
            return 'document';
        }
    }

    // Vérifier si la publication a un fichier
    public function hasFile()
    {
        return !empty($this->fichier);
    }

    // Obtenir l'icône du fichier
    public function getFileIcon()
    {
        if (!$this->fichier) return 'fa-file';

        $extension = strtolower(pathinfo($this->fichier, PATHINFO_EXTENSION));

        switch ($extension) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fa-file-powerpoint';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'webp':
                return 'fa-file-image';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return 'fa-file-video';
            case 'zip':
            case 'rar':
            case '7z':
                return 'fa-file-archive';
            default:
                return 'fa-file';
        }
    }
}
