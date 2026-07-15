import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-offres',
  templateUrl: './offres.component.html',
  styleUrls: ['./offres.component.css']
})
export class OffresComponent implements OnInit {
  offreForm: FormGroup;
  offres: any[] = [];
  loading = false;
  isEdit = false;
  editId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.offreForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      duration: ['', Validators.required],
      description: [''],
      caracteristiques: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadOffres();
    this.addFeature(); // Par défaut
  }

  loadOffres() {
    this.loading = true;
    this.adminService.getOffres().subscribe({
      next: (data) => { 
        this.offres = data.map(o => ({
          ...o,
          features: typeof o.featuresJson === 'string' ? JSON.parse(o.featuresJson) : []
        })); 
        this.loading = false; 
      },
      error: () => this.loading = false
    });
  }

  get caracteristiques(): FormArray {
    return this.offreForm.get('caracteristiques') as FormArray;
  }

  addFeature(val: string = ''): void {
    this.caracteristiques.push(this.fb.control(val));
  }

  removeFeature(index: number): void {
    this.caracteristiques.removeAt(index);
  }

  editOffre(offre: any) {
    this.isEdit = true;
    this.editId = offre.id;
    this.offreForm.patchValue({
      name: offre.name,
      price: offre.price,
      duration: offre.duration,
      description: offre.description
    });
    this.caracteristiques.clear();
    offre.features.forEach((f: string) => this.addFeature(f));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteOffre(id: number) {
    if (confirm('Supprimer cette offre ?')) {
      this.adminService.deleteOffre(id).subscribe(() => this.loadOffres());
    }
  }

  resetForm() {
    this.isEdit = false;
    this.editId = null;
    this.offreForm.reset();
    this.caracteristiques.clear();
    this.addFeature();
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.offreForm.invalid) {
      this.errorMessage = 'Veuillez remplir les champs obligatoires (nom, prix, durée).';
      return;
    }

    const { name, price, duration, description, caracteristiques } = this.offreForm.value;
    // Filtrer les caractéristiques vides
    const filteredFeatures = (caracteristiques as string[]).filter(f => f && f.trim() !== '');
    const payload = {
      name,
      price: parseFloat(price),
      duration,
      description: description || '',
      featuresJson: JSON.stringify(filteredFeatures)
    };

    if (this.isEdit && this.editId) {
      this.adminService.updateOffre(this.editId, payload).subscribe({
        next: () => {
          this.successMessage = 'Offre modifiée avec succès !';
          this.loadOffres();
          setTimeout(() => this.resetForm(), 1500);
        },
        error: (err) => {
          console.error('Erreur update:', err);
          this.errorMessage = 'Erreur lors de la modification. Vérifiez les données.';
        }
      });
    } else {
      this.adminService.createOffre(payload).subscribe({
        next: () => {
          this.successMessage = 'Offre créée avec succès !';
          this.loadOffres();
          setTimeout(() => this.resetForm(), 1500);
        },
        error: (err) => {
          console.error('Erreur create:', err);
          this.errorMessage = 'Erreur lors de la création. Vérifiez les données.';
        }
      });
    }
  }
}
